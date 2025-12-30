import { NextResponse } from "next/server";
import { getMarketSeries } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Timeframe = "all" | "30d" | "7d" | "24h";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol");
  const timeframeRaw = url.searchParams.get("timeframe");
  const pointsRaw = url.searchParams.get("points");

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

  try {
    const { series } = await getMarketSeries(symbol, timeframe, safePoints);
    return NextResponse.json({ series });
  } catch (error) {
    if (error instanceof Error && error.message === "Token not found") {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

