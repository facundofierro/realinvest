import { NextResponse } from "next/server";
import { getWalletBalances } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const balances = await getWalletBalances();
  return NextResponse.json({ balances });
}

