import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { WalletBalance } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const balances = await readSampleJson<WalletBalance[]>("walletBalances.json");
  return NextResponse.json({ balances });
}

