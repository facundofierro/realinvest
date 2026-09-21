import type { MarketOrderBook, OrderBookLevel } from "@/types/wallet";
import { orderBookLevels } from "@repo/db";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getMarketTokenBySymbol } from "./market";

function makeDepth(currentPrice: number): {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
} {
  const asks = Array.from({ length: 6 })
    .map((_, i) => ({
      price: currentPrice * (1 + (i + 1) * 0.005),
      amount: Math.floor((Math.sin(i * 123.45) * 0.5 + 0.5) * 500) + 50,
    }))
    .reverse();

  const bids = Array.from({ length: 6 }).map((_, i) => ({
    price: currentPrice * (1 - (i + 1) * 0.005),
    amount: Math.floor((Math.cos(i * 123.45) * 0.5 + 0.5) * 500) + 50,
  }));

  return { asks, bids };
}

export async function getMarketOrderBook(symbol: string): Promise<MarketOrderBook> {
  const token = await getMarketTokenBySymbol(symbol);
  if (!token) {
    throw new Error("Token not found");
  }

  const [asks, bids] = await Promise.all([
    getDb().select({ price: orderBookLevels.price, amount: orderBookLevels.amount })
      .from(orderBookLevels).where(and(eq(orderBookLevels.tokenId, token.id), eq(orderBookLevels.side, "ask")))
      .orderBy(asc(orderBookLevels.price)),
    getDb().select({ price: orderBookLevels.price, amount: orderBookLevels.amount })
      .from(orderBookLevels).where(and(eq(orderBookLevels.tokenId, token.id), eq(orderBookLevels.side, "bid")))
      .orderBy(desc(orderBookLevels.price)),
  ]);

  if (asks.length || bids.length) {
    return {
      asks,
      bids,
    };
  }

  const { asks: generatedAsks, bids: generatedBids } = makeDepth(token.priceUsd);

  return { asks: generatedAsks, bids: generatedBids };
}
