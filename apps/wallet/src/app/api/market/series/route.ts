import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { MarketToken } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Timeframe =
  | "all"
  | "30d"
  | "7d"
  | "24h";

function getChangePct(
  token: MarketToken,
  timeframe: Timeframe
): number {
  if (timeframe === "24h")
    return token.change24hPct;
  if (timeframe === "7d")
    return token.change7dPct;
  if (timeframe === "30d")
    return token.change30dPct;
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
      (acc, ch) =>
        acc + ch.charCodeAt(0),
      0
    );
  const drift = changePct / 100;
  const out: number[] = [];

  for (let i = 0; i < points; i++) {
    const t =
      i / Math.max(1, points - 1);
    const wave =
      Math.sin(
        (t * 5 + seedSum / 37) *
          Math.PI *
          2
      ) *
        0.35 +
      Math.sin(
        (t * 11 + seedSum / 53) *
          Math.PI *
          2
      ) *
        0.2;
    const trend = (t - 0.5) * drift * 2;
    out.push(
      base * (1 + trend + wave * 0.02)
    );
  }

  return out;
}

export async function GET(
  request: Request
) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get(
    "symbol"
  );
  const timeframeRaw =
    url.searchParams.get("timeframe");
  const pointsRaw =
    url.searchParams.get("points");

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing symbol" },
      { status: 400 }
    );
  }

  const timeframe: Timeframe =
    timeframeRaw === "24h" ||
    timeframeRaw === "7d" ||
    timeframeRaw === "30d" ||
    timeframeRaw === "all"
      ? timeframeRaw
      : "all";

  const points =
    typeof pointsRaw === "string"
      ? Number(pointsRaw)
      : NaN;
  const safePoints =
    Number.isFinite(points) && points > 4
      ? Math.min(Math.floor(points), 400)
      : 34;

  const tokens =
    await readSampleJson<MarketToken[]>(
      "marketTokens.json"
    );
  const token =
    tokens.find((t) => t.symbol === symbol) ??
    null;

  if (!token) {
    return NextResponse.json(
      { error: "Token not found" },
      { status: 404 }
    );
  }

  const changePct = getChangePct(
    token,
    timeframe
  );
  const series = makeSeries(
    symbol,
    changePct,
    safePoints
  );

  return NextResponse.json({ series });
}

