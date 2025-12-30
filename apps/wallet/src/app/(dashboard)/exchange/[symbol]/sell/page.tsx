import ExchangeSellPage from "@/components/pages/exchange-sell-page";
import {
  getMarketTokenBySymbol,
  getWalletPositions,
} from "@/lib/api";
import type { Position } from "@/types/wallet";

function calculateOwnedTokens(
  positions: Position[],
  symbol: string
): number {
  const relevant = positions.filter(
    (p) => p.tokenSymbol === symbol
  );
  const bought = relevant
    .filter((p) => p.side === "BUY")
    .reduce(
      (acc, p) => acc + p.filledAmount,
      0
    );
  const sold = relevant
    .filter((p) => p.side === "SELL")
    .reduce(
      (acc, p) => acc + p.filledAmount,
      0
    );
  return Math.max(0, bought - sold);
}

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  const [token, positions] =
    await Promise.all([
      getMarketTokenBySymbol(symbol),
      getWalletPositions(),
    ]);

  if (!token) {
    return <div>Token not found</div>;
  }

  const ownedTokens =
    calculateOwnedTokens(
      positions,
      symbol
    );

  return (
    <ExchangeSellPage
      token={token}
      ownedTokens={ownedTokens}
    />
  );
}
