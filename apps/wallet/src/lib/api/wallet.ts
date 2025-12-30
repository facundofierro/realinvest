import { readSampleJson } from "@/lib/sample-data";
import type { WalletBalance } from "@/types/wallet";

export async function getWalletBalances(): Promise<WalletBalance[]> {
  return await readSampleJson<WalletBalance[]>("walletBalances.json");
}