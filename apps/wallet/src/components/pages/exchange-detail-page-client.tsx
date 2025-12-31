"use client";

import type {
  Holding,
  MarketOrderBook,
  MarketSeries,
  MarketToken,
  Position,
  WalletBalance,
} from "@/types/wallet";
import ExchangeDetailPage from "@/components/pages/exchange-detail-page";

export interface ExchangeDetailPageClientProps {
  token: MarketToken;
  orderBook: MarketOrderBook;
  series: MarketSeries;
  positions: Position[];
  balances: WalletBalance[];
  holdings: Holding[];
  onFavorite: (tokenId: string) => void;
  isFavorite: boolean;
}

export default function ExchangeDetailPageClient(
  props: ExchangeDetailPageClientProps
) {
  return (
    <ExchangeDetailPage {...props} />
  );
}
