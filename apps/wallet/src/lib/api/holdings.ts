import { readSampleJson } from "@/lib/sample-data";
import type { Holding } from "@/types/wallet";

export async function getWalletHoldings(): Promise<Holding[]> {
  return await readSampleJson<Holding[]>("walletHoldings.json");
}