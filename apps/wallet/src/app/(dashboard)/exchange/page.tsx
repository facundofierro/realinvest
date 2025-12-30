import ExchangePage from "@/components/pages/exchange-page";
import {
  getMarketTokens,
  getProjects,
  getWalletBalances,
} from "@/lib/api";

export default async function Page() {
  const [tokens, projects, balances] = await Promise.all([
    getMarketTokens(),
    getProjects(),
    getWalletBalances(),
  ]);

  return (
    <ExchangePage
      tokens={tokens}
      projects={projects}
      balances={balances}
    />
  );
}