import ExchangePage from "@/components/pages/exchange-page";
import {
  getMarketTokens,
  getTransactions,
  getWalletPositions,
} from "@/lib/api";

export default async function Page() {
  const [
    tokens,
    positions,
    transactions,
  ] = await Promise.all([
    getMarketTokens(),
    getWalletPositions(),
    getTransactions(),
  ]);

  return (
    <ExchangePage
      tokens={tokens}
      positions={positions}
      transactions={transactions}
    />
  );
}
