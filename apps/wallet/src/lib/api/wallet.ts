import { balances } from "@repo/db";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/current-user";
import { getDb } from "@/lib/db";
import type { WalletBalance } from "@/types/wallet";

export async function getWalletBalances(): Promise<WalletBalance[]> {
  const userId = await getCurrentUserId();
  return getDb().select({ currencyCode: balances.currencyCode, available: balances.available,
    locked: balances.locked }).from(balances)
    .where(eq(balances.userId, userId));
}
