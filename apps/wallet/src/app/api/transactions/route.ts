import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const transactions = await getTransactions();
  return NextResponse.json({ transactions });
}
