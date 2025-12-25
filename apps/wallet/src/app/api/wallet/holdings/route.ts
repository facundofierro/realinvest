import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { Holding } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const holdings = await readSampleJson<Holding[]>("walletHoldings.json");
  return NextResponse.json({ holdings });
}

