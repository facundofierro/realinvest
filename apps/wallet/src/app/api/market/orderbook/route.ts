import { NextResponse } from "next/server";
import { getMarketOrderBook } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await requireUser())) return unauthorizedResponse();
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
