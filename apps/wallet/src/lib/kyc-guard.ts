import { NextResponse } from "next/server";
import type { KycStatus } from "@repo/providers-kyc";
import { getKycProvider } from "@/lib/kyc";

export type KycBlockedStatus = Exclude<KycStatus, "approved">;
export type KycBlock = { status: KycBlockedStatus; rejectionReason: string | null };

export function kycBlockedResponse({ status, rejectionReason }: KycBlock) {
  return NextResponse.json(
    { error: "kyc_required", status, rejectionReason },
    { status: 403 },
  );
}

/** Uses the KYC provider so pending applications can resolve before authorization. */
export async function checkKycApproved(userId: string): Promise<KycBlock | null> {
  const application = await getKycProvider().getApplication(userId);
  const status = application?.status ?? "none";
  if (status === "approved") return null;
  return { status, rejectionReason: application?.rejectionReason ?? null };
}
