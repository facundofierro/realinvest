import { balances, holdings, positions, users } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { getCustodyProvider } from "@/lib/custody";
import { getDb } from "@/lib/db";
import { getOrCreateCustodyVault, USDT_ASSET_ID } from "./custody-wallet";

export const MARKET_MAKER_USER_ID = "system-market-maker";
const MARKET_MAKER_EMAIL = "market-maker@realinvest.internal";
const MARKET_MAKER_USDT_SEED = "10000000";
const MARKET_MAKER_TOKEN_INVENTORY = 1_000_000;

function generateInitialDepth(priceUsd: number): { asks: Array<{ price: number; amount: number }>; bids: Array<{ price: number; amount: number }> } {
  const asks = Array.from({ length: 6 }).map((_, index) => ({
    price: Math.round(priceUsd * (1 + (index + 1) * 0.005) * 100) / 100,
    amount: Math.floor((Math.sin(index * 123.45) * 0.5 + 0.5) * 500) + 50,
  })).reverse();
  const bids = Array.from({ length: 6 }).map((_, index) => ({
    price: Math.round(priceUsd * (1 - (index + 1) * 0.005) * 100) / 100,
    amount: Math.floor((Math.cos(index * 123.45) * 0.5 + 0.5) * 500) + 50,
  }));
  return { asks, bids };
}

export async function getOrCreateMarketMaker() {
  await getDb().insert(users).values({ id: MARKET_MAKER_USER_ID, name: "Market Maker", email: MARKET_MAKER_EMAIL }).onConflictDoNothing();
  const [existingBalance] = await getDb().select().from(balances)
    .where(and(eq(balances.userId, MARKET_MAKER_USER_ID), eq(balances.currencyCode, "USDT")));
  const vault = await getOrCreateCustodyVault(MARKET_MAKER_USER_ID);
  await getCustodyProvider().mintAsset({
    vaultAccountId: vault.id,
    assetId: USDT_ASSET_ID,
    amount: MARKET_MAKER_USDT_SEED,
    idempotencyKey: `market-maker-seed-usdt-${vault.id}`,
  });
  if (!existingBalance) {
    await getDb().update(balances).set({ available: Number(MARKET_MAKER_USDT_SEED) })
      .where(and(eq(balances.userId, MARKET_MAKER_USER_ID), eq(balances.currencyCode, "USDT")));
  }
  return vault;
}

export async function ensureMarketMakerLiquidity(tokenId: string, priceUsd: number) {
  await getOrCreateMarketMaker();
  const [existing] = await getDb().select().from(holdings)
    .where(and(eq(holdings.userId, MARKET_MAKER_USER_ID), eq(holdings.tokenId, tokenId)));
  if (existing) return;
  await getDb().insert(holdings).values({ userId: MARKET_MAKER_USER_ID, tokenId, tokens: MARKET_MAKER_TOKEN_INVENTORY }).onConflictDoNothing();
  const { asks, bids } = generateInitialDepth(priceUsd);
  await getDb().insert(positions).values([
    ...asks.map((level) => ({ userId: MARKET_MAKER_USER_ID, tokenId, side: "SELL" as const, totalAmount: level.amount, filledAmount: 0, orderPriceUsd: level.price, openedMarketPriceUsd: priceUsd, status: "OPEN" as const })),
    ...bids.map((level) => ({ userId: MARKET_MAKER_USER_ID, tokenId, side: "BUY" as const, totalAmount: level.amount, filledAmount: 0, orderPriceUsd: level.price, openedMarketPriceUsd: priceUsd, status: "OPEN" as const })),
  ]);
}
