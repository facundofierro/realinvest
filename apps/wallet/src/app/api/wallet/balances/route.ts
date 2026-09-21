import { NextResponse } from "next/server";
import { getWalletBalances } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const balances = await getWalletBalances();
  return NextResponse.json({ balances });
}
