import { marketTokens, positions } from "@repo/db";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/current-user";
import { getDb } from "@/lib/db";
import type { Position } from "@/types/wallet";

export async function getWalletPositions(): Promise<Position[]> {
  const userId = await getCurrentUserId();
  const rows = await getDb().select({
    id: positions.id, tokenId: positions.tokenId, side: positions.side,
    totalAmount: positions.totalAmount, filledAmount: positions.filledAmount,
    orderPriceUsd: positions.orderPriceUsd, openedMarketPriceUsd: positions.openedMarketPriceUsd,
    openedAt: positions.openedAt, status: positions.status, tokenSymbol: marketTokens.symbol,
    marketPriceUsd: marketTokens.priceUsd,
  }).from(positions).innerJoin(marketTokens, eq(positions.tokenId, marketTokens.id))
    .where(eq(positions.userId, userId)).orderBy(positions.openedAt);
  return rows.map((row) => ({
    ...row, openedAt: row.openedAt.toISOString(),
    openedMarketPriceUsd: row.openedMarketPriceUsd ?? undefined,
  }));
}

export async function createPosition(positionId: string): Promise<{ ok: boolean; positionId: string }> {
  // In a real app, this would create a position in the database
  return { ok: true, positionId };
}
