import { NextResponse } from "next/server";
import type { KycStatus } from "@repo/providers-kyc";
import { getKycProvider } from "@/lib/kyc";

export type KycBlockedStatus = Exclude<KycStatus, "approved">;

export function kycBlockedResponse(status: KycBlockedStatus, rejectionReason?: string | null) {
  return NextResponse.json(
    { error: "kyc_required", status, rejectionReason: rejectionReason ?? null },
    { status: 403 },
  );
}

/** Uses the KYC provider so pending applications can resolve before authorization. */
export async function checkKycApproved(userId: string): Promise<KycBlockedStatus | null> {
  const status = await getKycProvider().getStatus(userId);
  return status === "approved" ? null : status;
}
