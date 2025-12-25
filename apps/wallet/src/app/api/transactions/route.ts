import { NextResponse } from "next/server";
import { readSampleJson } from "@/lib/sample-data";
import type { Transaction } from "@/types/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const transactions = await readSampleJson<Transaction[]>("transactions.json");
  return NextResponse.json({ transactions });
}

