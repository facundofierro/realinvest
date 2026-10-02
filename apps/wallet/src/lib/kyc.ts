import { createMockKycProvider, type KycProvider } from "@repo/providers-kyc";
import { getDb } from "@/lib/db";

const globalForKyc = globalThis as unknown as { kycProvider?: KycProvider };

export function getKycProvider(): KycProvider {
  return (globalForKyc.kycProvider ??= createMockKycProvider(getDb()));
}
