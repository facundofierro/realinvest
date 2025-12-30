import ExchangeDetailPage from "@/components/pages/exchange-detail-page";
import {
  getMarketTokenBySymbol,
  getMarketOrderBook,
  getMarketSeries,
  getWalletPositions,
} from "@/lib/api";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  let token;
  let orderBook;
  let series;
  let positions;

  try {
    [
      token,
      orderBook,
      series,
      positions,
    ] = await Promise.all([
      getMarketTokenBySymbol(symbol),
      getMarketOrderBook(symbol),
      getMarketSeries(
        symbol,
        "24h",
        100
      ),
      getWalletPositions(),
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
      onFavorite={() => {}} // This would need to be implemented
      isFavorite={token.isFavorite}
    />
  );
}
