import { NextResponse } from "next/server";
import { getMarketOrderBook } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing symbol" },
      { status: 400 }
    );
  }

  try {
    const orderBook = await getMarketOrderBook(symbol);
    return NextResponse.json(orderBook);
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
