import { NextResponse } from "next/server";
import { getMarketTokens } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireUser())) return unauthorizedResponse();
  const tokens = await getMarketTokens();
  return NextResponse.json({ tokens });
}
