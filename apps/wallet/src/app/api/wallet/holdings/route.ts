import { NextResponse } from "next/server";
import { getWalletHoldings } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { syncPendingCustodyState } from "@/lib/api/custody-wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  await syncPendingCustodyState(user.id);
  const holdings = await getWalletHoldings();
  return NextResponse.json({ holdings });
}
