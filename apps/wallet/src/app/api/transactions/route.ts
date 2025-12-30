import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const transactions = await getTransactions();
  return NextResponse.json({ transactions });
}

