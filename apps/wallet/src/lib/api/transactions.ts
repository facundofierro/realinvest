import { readSampleJson } from "@/lib/sample-data";
import type { Transaction } from "@/types/wallet";

export async function getTransactions(): Promise<Transaction[]> {
  return await readSampleJson<Transaction[]>("transactions.json");
}