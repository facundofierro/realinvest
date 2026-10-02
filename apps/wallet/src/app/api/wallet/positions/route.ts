import { NextResponse } from "next/server";
import { getWalletPositions } from "@/lib/api";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";
import { syncPendingCustodyState } from "@/lib/api/custody-wallet";
import { z } from "zod";
import { placeOrder, TradingError } from "@/lib/api/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRADING_ERROR_STATUS: Record<string, number> = {
  TOKEN_NOT_FOUND: 404,
  INVALID_PRICE: 400,
  INSUFFICIENT_BALANCE: 409,
  INSUFFICIENT_HOLDINGS: 409,
  NO_LIQUIDITY: 409,
};

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  await syncPendingCustodyState(user.id);
  const positions = await getWalletPositions();
  return NextResponse.json({ positions });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  const parsed = z.object({
    tokenSymbol: z.string().min(1), side: z.enum(["BUY", "SELL"]), orderType: z.enum(["MARKET", "LIMIT"]),
    totalAmount: z.number().int().positive(), orderPriceUsd: z.number().positive().optional(),
  }).refine((data) => data.orderType !== "LIMIT" || typeof data.orderPriceUsd === "number", { message: "orderPriceUsd is required for LIMIT orders" })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid position request", issues: parsed.error.issues }, { status: 400 });
  try {
    const position = await placeOrder(user.id, parsed.data);
    return NextResponse.json({ position }, { status: 201 });
  } catch (error) {
    if (error instanceof TradingError) return NextResponse.json({ error: error.message, code: error.code }, { status: TRADING_ERROR_STATUS[error.code] ?? 409 });
    throw error;
  }
}
