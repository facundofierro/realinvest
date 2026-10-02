import { transactions } from "@repo/db";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Transaction } from "@/types/wallet";

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const rows = await getDb().select().from(transactions)
    .where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  return rows.map((row) => ({
    id: row.id, type: row.type, status: row.status, createdAt: row.createdAt.toISOString(),
    amount: { currencyCode: row.currencyCode, amount: row.amount },
    description: row.description ?? undefined, metadata: row.metadata ?? undefined,
  }));
}
