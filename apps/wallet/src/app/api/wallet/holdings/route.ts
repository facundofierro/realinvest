import { NextResponse } from "next/server";
import { getWalletHoldings } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const holdings = await getWalletHoldings();
  return NextResponse.json({ holdings });
}

