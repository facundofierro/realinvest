import type { Holding } from "@/types/wallet";

export interface PortfolioTotals {
  totalValue: number;
  totalCostBasis: number;
  pnlAbs: number;
  pnlPct: number;
}

export function computeHoldingsTotals(holdings: Holding[]): PortfolioTotals {
  let totalValue = 0;
  let totalCostBasis = 0;

  for (const holding of holdings) {
    totalValue += holding.tokens * holding.marketPriceUsd;
    totalCostBasis +=
      holding.tokens * (holding.costBasisPriceUsd ?? holding.marketPriceUsd);
  }

  const pnlAbs = totalValue - totalCostBasis;
  const pnlPct = totalCostBasis > 0 ? (pnlAbs / totalCostBasis) * 100 : 0;

  return { totalValue, totalCostBasis, pnlAbs, pnlPct };
}
