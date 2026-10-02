import { balances } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { WalletBalance } from "@/types/wallet";

export async function getWalletBalances(userId: string): Promise<WalletBalance[]> {
  return getDb().select({ currencyCode: balances.currencyCode, available: balances.available,
    locked: balances.locked }).from(balances)
    .where(eq(balances.userId, userId));
}
