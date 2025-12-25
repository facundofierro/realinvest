import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { MarketToken } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tokens = await readSampleJson<MarketToken[]>("marketTokens.json");
  return NextResponse.json({ tokens });
}

