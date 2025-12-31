import ExchangeDetailPage from "@/components/pages/exchange-detail-page";
import {
  getMarketTokenBySymbol,
  getMarketOrderBook,
  getMarketSeries,
  getWalletBalances,
  getWalletHoldings,
  getWalletPositions,
} from "@/lib/api";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  async function onFavorite(
    tokenId: string
  ) {
    "use server";
    void tokenId;
  }

  let token;
  let orderBook;
  let series;
  let positions;
  let balances;
  let holdings;

  try {
    [
      token,
      orderBook,
      series,
      positions,
      balances,
      holdings,
    ] = await Promise.all([
      getMarketTokenBySymbol(symbol),
      getMarketOrderBook(symbol),
      getMarketSeries(
        symbol,
        "24h",
        100
      ),
      getWalletPositions(),
      getWalletBalances(),
      getWalletHoldings(),
    ]);
  } catch {
    return (
      <div>
        Error loading token data
      </div>
    );
  }

  if (!token) {
    return <div>Token not found</div>;
  }

  return (
    <ExchangeDetailPage
      token={token}
      orderBook={orderBook}
      series={series}
      positions={positions.filter(
        (p) => p.tokenSymbol === symbol
      )}
      balances={balances}
      holdings={holdings}
      onFavorite={onFavorite}
      isFavorite={token.isFavorite}
    />
  );
}
