import { holdings, marketTokens, projects, units } from "@repo/db";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/current-user";
import { getDb } from "@/lib/db";
import type { Holding } from "@/types/wallet";

export async function getWalletHoldings(): Promise<Holding[]> {
  const userId = await getCurrentUserId();
  const rows = await getDb().select({
    id: holdings.id, tokenId: holdings.tokenId, tokens: holdings.tokens,
    costBasisPriceUsd: holdings.costBasisPriceUsd, tokenSymbol: marketTokens.symbol,
    marketPriceUsd: marketTokens.priceUsd, changePct: marketTokens.changeAllPct,
    projectTitle: projects.title, location: projects.location, unitCode: units.unitCode,
  }).from(holdings).innerJoin(marketTokens, eq(holdings.tokenId, marketTokens.id))
    .innerJoin(projects, eq(marketTokens.projectId, projects.id))
    .leftJoin(units, eq(marketTokens.unitId, units.id))
    .where(eq(holdings.userId, userId)).orderBy(holdings.id);

  return rows.map((row) => ({
    ...row,
    unitCode: row.unitCode ?? row.tokenSymbol.split("-")[2] ?? "",
    costBasisPriceUsd: row.costBasisPriceUsd ?? undefined,
  }));
}
