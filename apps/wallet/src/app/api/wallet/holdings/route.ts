import { NextResponse } from "next/server";
import { getWalletHoldings } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const holdings = await getWalletHoldings();
  return NextResponse.json({ holdings });
}
