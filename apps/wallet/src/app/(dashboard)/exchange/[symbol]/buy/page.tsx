import ExchangeBuyPage from "@/components/pages/exchange-buy-page";
import { getMarketTokenBySymbol, getWalletBalances } from "@/lib/api";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  const [token, balances] = await Promise.all([
    getMarketTokenBySymbol(symbol),
    getWalletBalances(),
  ]);

  if (!token) {
    return <div>Token not found</div>;
  }

  const usdtBalance = balances.find((b) => b.currencyCode === "USDT") ?? {
    currencyCode: "USDT",
    available: 0,
    locked: 0,
  };

  return (
    <ExchangeBuyPage
      token={token}
      usdtBalance={usdtBalance}
    />
  );
}