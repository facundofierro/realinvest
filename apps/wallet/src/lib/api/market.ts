import { marketTokens, projects } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { MarketToken } from "@/types/wallet";

function mapMarketToken(row: {
  id: string; unitId: string | null; symbol: string; projectId: string; projectTitle: string;
  priceUsd: number; marketCapUsd: number; change24hPct: number; change7dPct: number;
  change30dPct: number; changeAllPct: number; liveSince: string; tokensAvailable: number | null;
  roiPct: number | null; buyPriceUsd: number | null; sellPriceUsd: number | null;
}): MarketToken {
  return {
    ...row, unitId: row.unitId ?? undefined, isFavorite: false,
    tokensAvailable: row.tokensAvailable ?? undefined, roiPct: row.roiPct ?? undefined,
    buyPriceUsd: row.buyPriceUsd ?? undefined, sellPriceUsd: row.sellPriceUsd ?? undefined,
  };
}

const marketTokenColumns = {
  id: marketTokens.id, unitId: marketTokens.unitId, symbol: marketTokens.symbol,
  projectId: marketTokens.projectId, projectTitle: projects.title, priceUsd: marketTokens.priceUsd,
  marketCapUsd: marketTokens.marketCapUsd, change24hPct: marketTokens.change24hPct,
  change7dPct: marketTokens.change7dPct, change30dPct: marketTokens.change30dPct,
  changeAllPct: marketTokens.changeAllPct, liveSince: marketTokens.liveSince,
  tokensAvailable: marketTokens.tokensAvailable, roiPct: marketTokens.roiPct,
  buyPriceUsd: marketTokens.buyPriceUsd, sellPriceUsd: marketTokens.sellPriceUsd,
};

export async function getMarketTokens(): Promise<MarketToken[]> {
  const rows = await getDb().select(marketTokenColumns).from(marketTokens)
    .innerJoin(projects, eq(marketTokens.projectId, projects.id)).orderBy(marketTokens.id);
  return rows.map(mapMarketToken);
}

export async function getMarketTokenBySymbol(symbol: string): Promise<MarketToken | null> {
  const [token] = await getDb().select(marketTokenColumns).from(marketTokens)
    .innerJoin(projects, eq(marketTokens.projectId, projects.id))
    .where(eq(marketTokens.symbol, symbol)).limit(1);
  return token ? mapMarketToken(token) : null;
}
