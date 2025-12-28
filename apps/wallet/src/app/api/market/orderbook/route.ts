import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type {
  MarketToken,
  OrderBookLevel,
} from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeDepth(
  currentPrice: number
): { asks: OrderBookLevel[]; bids: OrderBookLevel[] } {
  const asks = Array.from({ length: 6 })
    .map((_, i) => ({
      price:
        currentPrice *
        (1 + (i + 1) * 0.005),
      amount:
        Math.floor(
          (Math.sin(i * 123.45) * 0.5 +
            0.5) *
            500
        ) + 50,
    }))
    .reverse();

  const bids = Array.from({ length: 6 }).map(
    (_, i) => ({
      price:
        currentPrice *
        (1 - (i + 1) * 0.005),
      amount:
        Math.floor(
          (Math.cos(i * 123.45) * 0.5 +
            0.5) *
            500
        ) + 50,
    })
  );

  return { asks, bids };
}

export async function GET(
  request: Request
) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get(
    "symbol"
  );

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing symbol" },
      { status: 400 }
    );
  }

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

  const currentPrice =
    typeof token.priceUsd === "number"
      ? token.priceUsd
      : 0;

  const { asks, bids } =
    makeDepth(currentPrice);

  return NextResponse.json({ asks, bids });
}

