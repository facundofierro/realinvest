import type { MarketOrderBook } from "@/types/wallet";
import { positions } from "@repo/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ensureMarketMakerLiquidity } from "./market-maker";
import { getMarketTokenBySymbol } from "./market";

export async function getMarketOrderBook(symbol: string): Promise<MarketOrderBook> {
  const token = await getMarketTokenBySymbol(symbol);
  if (!token) throw new Error("Token not found");
  await ensureMarketMakerLiquidity(token.id, token.priceUsd);

  const remaining = sql<number>`SUM(${positions.totalAmount} - ${positions.filledAmount})`.as("amount");
  const openStatus = or(eq(positions.status, "OPEN"), eq(positions.status, "PARTIALLY_FILLED"));
  const [asks, bids] = await Promise.all([
    getDb().select({ price: positions.orderPriceUsd, amount: remaining }).from(positions)
      .where(and(eq(positions.tokenId, token.id), eq(positions.side, "SELL"), openStatus))
      .groupBy(positions.orderPriceUsd).orderBy(asc(positions.orderPriceUsd)),
    getDb().select({ price: positions.orderPriceUsd, amount: remaining }).from(positions)
      .where(and(eq(positions.tokenId, token.id), eq(positions.side, "BUY"), openStatus))
      .groupBy(positions.orderPriceUsd).orderBy(desc(positions.orderPriceUsd)),
  ]);
  return { asks, bids };
}
