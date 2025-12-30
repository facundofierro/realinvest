import type {
  MarketToken,
  MarketOrderBook,
  OrderBookLevel,
} from "@/types/wallet";
import { readSampleJson } from "@/lib/sample-data";

type Timeframe = "all" | "30d" | "7d" | "24h";

function getChangePct(
  token: MarketToken,
  timeframe: Timeframe
): number {
  if (timeframe === "24h") return token.change24hPct;
  if (timeframe === "7d") return token.change7dPct;
  if (timeframe === "30d") return token.change30dPct;
  return token.changeAllPct;
}

function makeSeries(
  seed: string,
  changePct: number,
  points: number
): number[] {
  const base = 100;
  const seedSum = seed
    .split("")
    .reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );
  const drift = changePct / 100;
  const out: number[] = [];

  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1);
    const wave =
      Math.sin((t * 5 + seedSum / 37) * Math.PI * 2) * 0.35 +
      Math.sin((t * 11 + seedSum / 53) * Math.PI * 2) * 0.2;
    const trend = (t - 0.5) * drift * 2;
    out.push(base * (1 + trend + wave * 0.02));
  }

  return out;
}

export function generateMarketSeries(
  symbol: string,
  timeframe: Timeframe,
  points: number
): number[] {
  // This is a mock implementation - in a real app, this would fetch actual market data
  const changePct = 5; // Mock change percentage
  return makeSeries(symbol, changePct, points);
}

export async function getMarketSeries(
  symbol: string,
  timeframe: Timeframe,
  points: number
): Promise<{ series: number[] }> {
  const tokens = await readSampleJson<MarketToken[]>("marketTokens.json");
  const token = tokens.find((t) => t.symbol === symbol) ?? null;

  if (!token) {
    throw new Error("Token not found");
  }

  const changePct = getChangePct(token, timeframe);
  const series = makeSeries(symbol, changePct, points);

  return { series };
}