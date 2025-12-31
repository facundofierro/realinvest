"use client";

import type {
  MarketToken,
  Position,
  Transaction,
} from "@/types/wallet";
import ExchangePage from "@/components/pages/exchange-page";

export interface ExchangePageClientProps {
  tokens: MarketToken[];
  positions: Position[];
  transactions: Transaction[];
}

export default function ExchangePageClient({
  tokens,
  positions,
  transactions,
}: ExchangePageClientProps) {
  return (
    <ExchangePage
      tokens={tokens}
      positions={positions}
      transactions={transactions}
    />
  );
}
