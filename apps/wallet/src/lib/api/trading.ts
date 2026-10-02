import { balances, holdings, marketTokens, positions, trades, transactions } from "@repo/db";
import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import { getCustodyProvider } from "@/lib/custody";
import { getDb } from "@/lib/db";
import { getOrCreateCustodyVault, USDT_ASSET_ID } from "./custody-wallet";
import { ensureMarketMakerLiquidity, MARKET_MAKER_USER_ID } from "./market-maker";

export type TradingErrorCode = "TOKEN_NOT_FOUND" | "INVALID_PRICE" | "INSUFFICIENT_BALANCE" | "INSUFFICIENT_HOLDINGS" | "NO_LIQUIDITY" | "POSITION_NOT_FOUND" | "NOT_CANCELLABLE";

export class TradingError extends Error {
  readonly code: TradingErrorCode;

  constructor(code: TradingErrorCode, message: string) {
    super(message);
    this.name = "TradingError";
    this.code = code;
  }
}

export interface PlaceOrderInput {
  tokenSymbol: string;
  side: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  totalAmount: number;
  orderPriceUsd?: number;
}

interface Fill {
  counterpartyPositionId: string;
  counterpartyUserId: string;
  amount: number;
  price: number;
}

export async function placeOrder(userId: string, input: PlaceOrderInput) {
  const [token] = await getDb().select().from(marketTokens).where(eq(marketTokens.symbol, input.tokenSymbol));
  if (!token) throw new TradingError("TOKEN_NOT_FOUND", "Unknown token symbol");
  if (input.orderType === "LIMIT" && !(input.orderPriceUsd && input.orderPriceUsd > 0)) {
    throw new TradingError("INVALID_PRICE", "Limit orders require a positive price");
  }
  const limitPrice = input.orderType === "LIMIT" ? input.orderPriceUsd! : null;
  await ensureMarketMakerLiquidity(token.id, token.priceUsd);

  if (input.side === "SELL") {
    const [holdingRow] = await getDb().select().from(holdings)
      .where(and(eq(holdings.userId, userId), eq(holdings.tokenId, token.id)));
    const availableTokens = (holdingRow?.tokens ?? 0) - (holdingRow?.lockedTokens ?? 0);
    if (availableTokens < input.totalAmount) throw new TradingError("INSUFFICIENT_HOLDINGS", "Not enough available tokens to place this sell order");
  }

  const oppositeSide = input.side === "BUY" ? "SELL" : "BUY";
  const resting = await getDb().select().from(positions).where(and(
    eq(positions.tokenId, token.id), eq(positions.side, oppositeSide),
    or(eq(positions.status, "OPEN"), eq(positions.status, "PARTIALLY_FILLED")),
    ne(positions.userId, userId),
  )).orderBy(input.side === "BUY" ? asc(positions.orderPriceUsd) : desc(positions.orderPriceUsd), asc(positions.openedAt));

  let remaining = input.totalAmount;
  const fills: Fill[] = [];
  for (const level of resting) {
    if (remaining <= 0) break;
    if (limitPrice !== null && input.side === "BUY" && level.orderPriceUsd > limitPrice) break;
    if (limitPrice !== null && input.side === "SELL" && level.orderPriceUsd < limitPrice) break;
    const levelRemaining = level.totalAmount - level.filledAmount;
    if (levelRemaining <= 0) continue;
    const take = Math.min(remaining, levelRemaining);
    fills.push({ counterpartyPositionId: level.id, counterpartyUserId: level.userId, amount: take, price: level.orderPriceUsd });
    remaining -= take;
  }
  const filledAmount = input.totalAmount - remaining;
  if (input.orderType === "MARKET" && filledAmount === 0) throw new TradingError("NO_LIQUIDITY", "No resting orders available to match this order");

  const totalMatchedCost = Math.round(fills.reduce((sum, fill) => sum + fill.amount * fill.price, 0) * 100) / 100;
  const restingRemainder = input.orderType === "LIMIT" ? remaining : 0;
  const restingReserve = restingRemainder > 0 ? Math.round(restingRemainder * limitPrice! * 100) / 100 : 0;
  if (input.side === "BUY") {
    const totalReserve = totalMatchedCost + restingReserve;
    const [balanceRow] = await getDb().select().from(balances)
      .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    if (!balanceRow || balanceRow.available < totalReserve) throw new TradingError("INSUFFICIENT_BALANCE", "Insufficient USDT balance for this order");
  }

  return applyMatchedOrder(userId, token, input, { limitPrice, filledAmount, fills, totalMatchedCost, restingReserve });
}

async function applyMatchedOrder(
  userId: string,
  token: typeof marketTokens.$inferSelect,
  input: PlaceOrderInput,
  plan: { limitPrice: number | null; filledAmount: number; fills: Fill[]; totalMatchedCost: number; restingReserve: number },
) {
  const { limitPrice, filledAmount, fills, totalMatchedCost, restingReserve } = plan;
  const { takerPosition, transferTasks } = await getDb().transaction(async (tx) => {
    if (input.side === "BUY") {
      const reserve = totalMatchedCost + restingReserve;
      const [updatedBalance] = await tx.update(balances).set({
        available: sql`${balances.available} - ${reserve}`,
        locked: sql`${balances.locked} + ${reserve}`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT"), sql`${balances.available} >= ${reserve}`)).returning();
      if (!updatedBalance) throw new TradingError("INSUFFICIENT_BALANCE", "Insufficient USDT balance for this order");
    } else {
      const [updatedHolding] = await tx.update(holdings).set({ lockedTokens: sql`${holdings.lockedTokens} + ${input.totalAmount}` })
        .where(and(eq(holdings.userId, userId), eq(holdings.tokenId, token.id), sql`${holdings.tokens} - ${holdings.lockedTokens} >= ${input.totalAmount}`)).returning();
      if (!updatedHolding) throw new TradingError("INSUFFICIENT_HOLDINGS", "Not enough available tokens to place this sell order");
    }

    const status = input.orderType === "MARKET"
      ? "FILLED"
      : filledAmount === 0 ? "OPEN" : filledAmount === input.totalAmount ? "FILLED" : "PARTIALLY_FILLED";
    const [takerPosition] = await tx.insert(positions).values({
      userId, tokenId: token.id, side: input.side, totalAmount: input.totalAmount, filledAmount,
      orderPriceUsd: limitPrice ?? token.priceUsd, openedMarketPriceUsd: token.priceUsd, status,
    }).returning();
    const transferTasks: Array<{ buyerUserId: string; sellerUserId: string; amount: number; buyTxnId: string; sellTxnId: string }> = [];

    for (const fill of fills) {
      const buyerUserId = input.side === "BUY" ? userId : fill.counterpartyUserId;
      const sellerUserId = input.side === "BUY" ? fill.counterpartyUserId : userId;
      const fillCost = Math.round(fill.amount * fill.price * 100) / 100;
      const [counterparty] = await tx.select().from(positions).where(eq(positions.id, fill.counterpartyPositionId));
      if (!counterparty) throw new TradingError("NO_LIQUIDITY", "Resting order is no longer available");
      const newCounterpartyFilled = counterparty.filledAmount + fill.amount;
      const counterpartyDone = newCounterpartyFilled >= counterparty.totalAmount;
      const isMarketMaker = counterparty.userId === MARKET_MAKER_USER_ID;
      await tx.update(positions).set({
        filledAmount: isMarketMaker && counterpartyDone ? 0 : newCounterpartyFilled,
        status: isMarketMaker ? "OPEN" : counterpartyDone ? "FILLED" : "PARTIALLY_FILLED",
      }).where(eq(positions.id, fill.counterpartyPositionId));

      if (counterparty.side === "BUY") {
        await tx.update(balances).set({ locked: sql`MAX(0, ${balances.locked} - ${fillCost})` })
          .where(and(eq(balances.userId, counterparty.userId), eq(balances.currencyCode, "USDT")));
      } else {
        await tx.update(holdings).set({ lockedTokens: sql`MAX(0, ${holdings.lockedTokens} - ${fill.amount})` })
          .where(and(eq(holdings.userId, counterparty.userId), eq(holdings.tokenId, token.id)));
      }

      await tx.insert(holdings).values({ userId: buyerUserId, tokenId: token.id, tokens: fill.amount, costBasisPriceUsd: fill.price })
        .onConflictDoUpdate({ target: [holdings.userId, holdings.tokenId], set: {
          tokens: sql`${holdings.tokens} + ${fill.amount}`,
          costBasisPriceUsd: sql`((${holdings.tokens} * COALESCE(${holdings.costBasisPriceUsd}, 0)) + (${fill.amount} * ${fill.price})) / (${holdings.tokens} + ${fill.amount})`,
        } });
      await tx.update(holdings).set({
        tokens: sql`${holdings.tokens} - ${fill.amount}`,
        lockedTokens: sql`MAX(0, ${holdings.lockedTokens} - ${fill.amount})`,
      }).where(and(eq(holdings.userId, sellerUserId), eq(holdings.tokenId, token.id)));

      await tx.insert(trades).values({
        tokenId: token.id, price: fill.price, amount: fill.amount, takerSide: input.side,
        buyPositionId: input.side === "BUY" ? takerPosition.id : fill.counterpartyPositionId,
        sellPositionId: input.side === "BUY" ? fill.counterpartyPositionId : takerPosition.id,
        buyUserId: buyerUserId, sellUserId: sellerUserId,
      });
      await tx.update(marketTokens).set({ priceUsd: fill.price }).where(eq(marketTokens.id, token.id));

      const tradeId = crypto.randomUUID();
      const [buyTxn] = await tx.insert(transactions).values({
        userId: buyerUserId, type: "BUY", status: "PENDING", amount: fillCost, currencyCode: "USDT",
        description: `Compra ${fill.amount} ${token.symbol} @ ${fill.price}`,
        metadata: { tradeId, tradeRole: "buyer", counterpartyUserId: sellerUserId, tokenId: token.id, amount: fill.amount, price: fill.price, totalUsd: fillCost },
      }).returning();
      const [sellTxn] = await tx.insert(transactions).values({
        userId: sellerUserId, type: "SELL", status: "PENDING", amount: fillCost, currencyCode: "USDT",
        description: `Venta ${fill.amount} ${token.symbol} @ ${fill.price}`,
        metadata: { tradeId, tradeRole: "seller", counterpartyUserId: buyerUserId, tokenId: token.id, amount: fill.amount, price: fill.price, totalUsd: fillCost },
      }).returning();
      transferTasks.push({ buyerUserId, sellerUserId, amount: fillCost, buyTxnId: buyTxn.id, sellTxnId: sellTxn.id });
    }
    return { takerPosition, transferTasks };
  });

  for (const task of transferTasks) {
    const buyerVault = await getOrCreateCustodyVault(task.buyerUserId);
    const sellerVault = await getOrCreateCustodyVault(task.sellerUserId);
    const transfer = await getCustodyProvider().createTransfer({
      assetId: USDT_ASSET_ID, amount: String(task.amount), sourceVaultAccountId: buyerVault.id,
      destination: { type: "VAULT_ACCOUNT", vaultAccountId: sellerVault.id },
      idempotencyKey: crypto.randomUUID(), note: `Trade settlement ${token.symbol}`,
    });
    for (const txnId of [task.buyTxnId, task.sellTxnId]) {
      const [row] = await getDb().select().from(transactions).where(eq(transactions.id, txnId));
      await getDb().update(transactions).set({ metadata: { ...(row!.metadata ?? {}), transferId: transfer.id, custodyStatus: transfer.status } })
        .where(eq(transactions.id, txnId));
    }
  }
  return takerPosition;
}

export async function cancelOrder(userId: string, positionId: string) {
  const [position] = await getDb().select().from(positions)
    .where(and(eq(positions.id, positionId), eq(positions.userId, userId)));
  if (!position) throw new TradingError("POSITION_NOT_FOUND", "Order not found");
  if (position.status !== "OPEN" && position.status !== "PARTIALLY_FILLED") {
    throw new TradingError("NOT_CANCELLABLE", "Order is not open");
  }
  const remaining = position.totalAmount - position.filledAmount;
  await getDb().transaction(async (tx) => {
    const [cancelled] = await tx.update(positions).set({ status: "CANCELLED" })
      .where(and(eq(positions.id, positionId), or(eq(positions.status, "OPEN"), eq(positions.status, "PARTIALLY_FILLED")))).returning();
    if (!cancelled) throw new TradingError("NOT_CANCELLABLE", "Order is not open");
    if (position.side === "BUY") {
      const releaseAmount = Math.round(remaining * position.orderPriceUsd * 100) / 100;
      await tx.update(balances).set({
        available: sql`${balances.available} + ${releaseAmount}`,
        locked: sql`MAX(0, ${balances.locked} - ${releaseAmount})`,
      }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
    } else {
      await tx.update(holdings).set({ lockedTokens: sql`MAX(0, ${holdings.lockedTokens} - ${remaining})` })
        .where(and(eq(holdings.userId, userId), eq(holdings.tokenId, position.tokenId)));
    }
  });
}
