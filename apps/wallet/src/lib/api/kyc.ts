import type { KycApplication, KycSubmissionInput } from "@repo/providers-kyc";
import { getCurrentUserId } from "@/lib/current-user";
import { getKycProvider } from "@/lib/kyc";

export async function getKycApplication(): Promise<KycApplication | null> {
  return getKycProvider().getApplication(await getCurrentUserId());
}

export async function submitKycApplication(input: KycSubmissionInput): Promise<KycApplication> {
  return getKycProvider().submitApplication(await getCurrentUserId(), input);
}
