import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/api-auth";
import { checkKycApproved, kycBlockedResponse } from "@/lib/kyc-guard";
import { getDepositDetails, simulateDeposit, syncPendingCustodyState, SIMULATED_DEPOSIT_USDT } from "@/lib/api/custody-wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  await syncPendingCustodyState(user.id);
  const { address } = await getDepositDetails(user.id);
  return NextResponse.json({ address: address.address, network: "TRC20", assetId: "USDT", qrValue: `usdt:${address.address}?network=TRC20` });
}

export async function POST() {
  const user = await requireUser();
  if (!user) return unauthorizedResponse();
  const blocked = await checkKycApproved(user.id);
  if (blocked) return kycBlockedResponse(blocked);
  const transaction = await simulateDeposit(user.id);
  return NextResponse.json({ transaction, amount: SIMULATED_DEPOSIT_USDT }, { status: 201 });
}
