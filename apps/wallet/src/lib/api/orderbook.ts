import type { MarketOrderBook, OrderBookLevel } from "@/types/wallet";
import { readSampleJson } from "@/lib/sample-data";

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
  const { readSampleJson } = await import("@/lib/sample-data");
  const { getMarketTokenBySymbol } = await import("./market");
  
  const token = await getMarketTokenBySymbol(symbol);
  
  if (!token) {
    throw new Error("Token not found");
  }

  // Try to get from fixture data first
  const orderBooks = await readSampleJson<Record<string, MarketOrderBook>>("marketOrderBooks.json");
  const fromFixture = orderBooks[symbol] ?? null;

  if (fromFixture) {
    return fromFixture;
  }

  // Generate mock orderbook if no fixture data
  const currentPrice = typeof token.priceUsd === "number" ? token.priceUsd : 0;
  const { asks, bids } = makeDepth(currentPrice);

  return { asks, bids };
}