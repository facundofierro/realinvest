import { readSampleJson } from "@/lib/sample-data";
import type { MarketToken } from "@/types/wallet";

export async function getMarketTokens(): Promise<MarketToken[]> {
  return await readSampleJson<MarketToken[]>("marketTokens.json");
}

export async function getMarketTokenBySymbol(symbol: string): Promise<MarketToken | null> {
  const tokens = await getMarketTokens();
  return tokens.find((t) => t.symbol === symbol) ?? null;
}