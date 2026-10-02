import { balances, holdings, marketTokens, positions, projects, transactions, units } from "@repo/db";
import { and, eq, sql } from "drizzle-orm";
import { getCustodyProvider } from "@/lib/custody";
import { getDb } from "@/lib/db";
import { parseUsdString } from "@/lib/format";
import {
  ensureProjectionBalance,
  getOrCreateCustodyVault,
  getOrCreatePlatformTreasuryVault,
  USDT_ASSET_ID,
} from "./custody-wallet";

export type PurchaseErrorCode = "UNIT_NOT_FOUND" | "NOT_TOKENIZED" | "NOT_AVAILABLE" | "SOLD_OUT" | "INSUFFICIENT_BALANCE";

export class PurchaseError extends Error {
  constructor(readonly code: PurchaseErrorCode, message: string) {
    super(message);
    this.name = "PurchaseError";
  }
}

export interface PurchaseUnitTokensInput {
  projectId: string;
  unitId: string;
  tokenAmount: number;
}

async function loadPurchasableUnit(projectId: string, unitId: string, tokenAmount: number) {
  const [unit] = await getDb().select().from(units)
    .where(and(eq(units.id, unitId), eq(units.projectId, projectId)));
  if (!unit) throw new PurchaseError("UNIT_NOT_FOUND", "Unit not found");
  if (!unit.isTokenized || !unit.tokenSymbol || !unit.totalTokens) {
    throw new PurchaseError("NOT_TOKENIZED", "This unit is not tokenized");
  }
  if (unit.statusRaw !== "available") {
    throw new PurchaseError("NOT_AVAILABLE", "This unit is not currently available for investment");
  }
  if ((unit.tokensSold ?? 0) + tokenAmount > unit.totalTokens) {
    throw new PurchaseError("SOLD_OUT", "Not enough tokens remaining for this unit");
  }
  return unit;
}

export async function purchaseUnitTokens(userId: string, input: PurchaseUnitTokensInput) {
  const unit = await loadPurchasableUnit(input.projectId, input.unitId, input.tokenAmount);
  const pricePerToken = Math.round((parseUsdString(unit.price) / unit.totalTokens!) * 100) / 100;
  const totalCost = Math.round(pricePerToken * input.tokenAmount * 100) / 100;

  await ensureProjectionBalance(userId);
  const [balanceRow] = await getDb().select().from(balances)
    .where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));
  if (!balanceRow || balanceRow.available < totalCost) {
    throw new PurchaseError("INSUFFICIENT_BALANCE", "Insufficient USDT balance");
  }

  const provider = getCustodyProvider();
  const userVault = await getOrCreateCustodyVault(userId);
  const treasuryVault = await getOrCreatePlatformTreasuryVault();
  const transfer = await provider.createTransfer({
    assetId: USDT_ASSET_ID,
    amount: String(totalCost),
    sourceVaultAccountId: userVault.id,
    destination: { type: "VAULT_ACCOUNT", vaultAccountId: treasuryVault.id },
    idempotencyKey: crypto.randomUUID(),
    note: `Purchase ${input.tokenAmount} ${unit.tokenSymbol}`,
  });

  await getDb().update(balances).set({
    available: sql`${balances.available} - ${totalCost}`,
    locked: sql`${balances.locked} + ${totalCost}`,
  }).where(and(eq(balances.userId, userId), eq(balances.currencyCode, "USDT")));

  const [transaction] = await getDb().insert(transactions).values({
    userId,
    type: "BUY",
    status: "PENDING",
    amount: totalCost,
    currencyCode: "USDT",
    description: `Purchase of ${input.tokenAmount} tokens of ${unit.unitCode} (${unit.tokenSymbol})`,
    metadata: {
      transferId: transfer.id,
      unitId: unit.id,
      projectId: unit.projectId,
      tokenAmount: input.tokenAmount,
      pricePerToken,
      totalDebit: totalCost,
      custodyStatus: transfer.status,
    },
  }).returning();
  return transaction;
}

export interface PurchaseSettlementDetails {
  unitId: string;
  tokenAmount: number;
  pricePerToken: number;
}

export async function applyPurchaseEffects(userId: string, details: PurchaseSettlementDetails) {
  return getDb().transaction(async (tx) => {
    const [unit] = await tx.select().from(units).where(eq(units.id, details.unitId));
    if (!unit || !unit.totalTokens) throw new PurchaseError("UNIT_NOT_FOUND", "Unit not found");

    const updatedUnits = await tx.update(units)
      .set({ tokensSold: sql`${units.tokensSold} + ${details.tokenAmount}` })
      .where(and(eq(units.id, unit.id), sql`${units.tokensSold} + ${details.tokenAmount} <= ${units.totalTokens}`))
      .returning({ tokensSold: units.tokensSold });
    if (updatedUnits.length === 0) throw new PurchaseError("SOLD_OUT", "Not enough tokens remaining for this unit");
    const newTokensSold = updatedUnits[0].tokensSold!;

    let [marketToken] = await tx.select().from(marketTokens).where(eq(marketTokens.unitId, unit.id));
    if (!marketToken) {
      const [project] = await tx.select().from(projects).where(eq(projects.id, unit.projectId));
      [marketToken] = await tx.insert(marketTokens).values({
        symbol: unit.tokenSymbol!, projectId: unit.projectId, unitId: unit.id,
        priceUsd: details.pricePerToken, marketCapUsd: details.pricePerToken * unit.totalTokens,
        change24hPct: 0, change7dPct: 0, change30dPct: 0, changeAllPct: 0,
        liveSince: new Date().toISOString(), tokensAvailable: unit.totalTokens - newTokensSold,
        roiPct: project?.roiPct ?? null, buyPriceUsd: details.pricePerToken, sellPriceUsd: details.pricePerToken,
      }).returning();
    } else {
      await tx.update(marketTokens).set({ tokensAvailable: unit.totalTokens - newTokensSold })
        .where(eq(marketTokens.id, marketToken.id));
    }

    await tx.insert(holdings).values({
      userId, tokenId: marketToken.id, tokens: details.tokenAmount, costBasisPriceUsd: details.pricePerToken,
    }).onConflictDoUpdate({
      target: [holdings.userId, holdings.tokenId],
      set: {
        tokens: sql`${holdings.tokens} + ${details.tokenAmount}`,
        costBasisPriceUsd: sql`((${holdings.tokens} * COALESCE(${holdings.costBasisPriceUsd}, 0)) + (${details.tokenAmount} * ${details.pricePerToken})) / (${holdings.tokens} + ${details.tokenAmount})`,
      },
    });

    await tx.insert(positions).values({
      userId, tokenId: marketToken.id, side: "BUY", totalAmount: details.tokenAmount,
      filledAmount: details.tokenAmount, orderPriceUsd: details.pricePerToken,
      openedMarketPriceUsd: details.pricePerToken, status: "FILLED",
    });
  });
}
