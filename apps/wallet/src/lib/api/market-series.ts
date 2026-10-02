import type { MarketToken } from "@/types/wallet";
import { trades } from "@repo/db";
import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getMarketTokenBySymbol } from "./market";

type Timeframe = "all" | "30d" | "7d" | "24h";

function getChangePct(token: MarketToken, timeframe: Timeframe): number {
  if (timeframe === "24h") return token.change24hPct;
  if (timeframe === "7d") return token.change7dPct;
  if (timeframe === "30d") return token.change30dPct;
  return token.changeAllPct;
}

function makeSyntheticSeries(seed: string, changePct: number, points: number): number[] {
  const base = 100;
  const seedSum = seed.split("").reduce((acc, character) => acc + character.charCodeAt(0), 0);
  const drift = changePct / 100;
  const out: number[] = [];
  for (let index = 0; index < points; index++) {
    const t = index / Math.max(1, points - 1);
    const wave = Math.sin((t * 5 + seedSum / 37) * Math.PI * 2) * 0.35 + Math.sin((t * 11 + seedSum / 53) * Math.PI * 2) * 0.2;
    const trend = (t - 0.5) * drift * 2;
    out.push(base * (1 + trend + wave * 0.02));
  }
  return out;
}

function timeframeToSince(timeframe: Timeframe): Date | null {
  const now = Date.now();
  if (timeframe === "24h") return new Date(now - 24 * 60 * 60 * 1000);
  if (timeframe === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (timeframe === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function bucketTrades(rows: Array<{ price: number; createdAt: Date }>, points: number): number[] {
  const start = rows[0]!.createdAt.getTime();
  const end = rows[rows.length - 1]!.createdAt.getTime();
  const span = Math.max(1, end - start);
  const closes = new Array<number>(points).fill(rows[0]!.price);
  let rowIndex = 0;
  let lastClose = rows[0]!.price;
  for (let index = 0; index < points; index++) {
    const bucketEnd = start + (span * (index + 1)) / points;
    while (rowIndex < rows.length && rows[rowIndex]!.createdAt.getTime() <= bucketEnd) {
      lastClose = rows[rowIndex]!.price;
      rowIndex++;
    }
    closes[index] = lastClose;
  }
  return closes;
}

export async function getMarketSeries(symbol: string, timeframe: Timeframe, points: number): Promise<{ series: number[] }> {
  const token = await getMarketTokenBySymbol(symbol);
  if (!token) throw new Error("Token not found");
  const since = timeframeToSince(timeframe);
  const rows = await getDb().select({ price: trades.price, createdAt: trades.createdAt }).from(trades)
    .where(since ? and(eq(trades.tokenId, token.id), gte(trades.createdAt, since)) : eq(trades.tokenId, token.id))
    .orderBy(asc(trades.createdAt));
  if (rows.length === 0) return { series: makeSyntheticSeries(symbol, getChangePct(token, timeframe), points) };
  return { series: bucketTrades(rows, points) };
}
