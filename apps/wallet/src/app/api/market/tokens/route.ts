import { NextResponse } from "next/server";
import { getMarketTokens } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tokens = await getMarketTokens();
  return NextResponse.json({ tokens });
}

