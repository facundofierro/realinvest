"use client";

import { formatPrice } from "@/lib/format";
import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import {
  ArrowLeft,
  Star,
  StarOff,
} from "lucide-react";
import {
  LineChart,
  CandlesChart,
  OrderBook,
} from "../exchange/charts";
import { TradeDialog } from "../exchange/trade-dialog";
import { MarketStats } from "../exchange/market-stats";
import { ViewSelector } from "../exchange/view-selector";
import type {
  MarketToken,
  Timeframe,
  ChartView,
} from "@/types/wallet";
import {
  useMarketToken,
  useMarketOrderBook,
  useMarketSeries,
  useWalletBalances,
  useWalletHoldings,
  useWalletPositions,
} from "@/hooks/use-queries";

function formatPct(
  value: number
): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

function getChangePct(
  token: MarketToken,
  timeframe: Timeframe
): number {
  if (timeframe === "24h")
    return token.change24hPct;
  if (timeframe === "7d")
    return token.change7dPct;
  if (timeframe === "30d")
    return token.change30dPct;
  return token.changeAllPct;
}

function makeSeries(
  seed: string,
  changePct: number,
  points: number
): number[] {
  const base = 100;
  const seedSum = seed
    .split("")
    .reduce(
      (acc, ch) =>
        acc + ch.charCodeAt(0),
      0
    );
  const drift = changePct / 100;
  const out: number[] = [];

  for (let i = 0; i < points; i++) {
    const t =
      i / Math.max(1, points - 1);
    const wave =
      Math.sin(
        (t * 5 + seedSum / 37) *
          Math.PI *
          2
      ) *
        0.35 +
      Math.sin(
        (t * 11 + seedSum / 53) *
          Math.PI *
          2
      ) *
        0.2;
    const trend = (t - 0.5) * drift * 2;
    out.push(
      base * (1 + trend + wave * 0.02)
    );
  }

  return out;
}

export interface ExchangeDetailPageProps {
  symbol: string;
}

export default function ExchangeDetailPage({
  symbol,
}: ExchangeDetailPageProps) {
  const router = useRouter();

  // Loading and error states
  // Timeframe state hoisted for query usage
  const [timeframe, setTimeframe] =
    useState<Timeframe>("24h");

  // Queries
  const {
    data: token,
    isLoading: isTokenLoading,
    error: tokenError,
  } = useMarketToken(symbol);
  const {
    data: orderBook,
    isLoading: isOrderBookLoading,
    error: orderBookError,
  } = useMarketOrderBook(symbol);
  const {
    data: series,
    isLoading: isSeriesLoading,
    error: seriesError,
  } = useMarketSeries(
    symbol,
    timeframe,
    100
  );
  const {
    data: allPositions = [],
    isLoading: isPositionsLoading,
  } = useWalletPositions();
  const { data: balances = [] } =
    useWalletBalances();
  const { data: holdings = [] } =
    useWalletHoldings();

  const positions = useMemo(
    () =>
      allPositions.filter(
        (p) => p.tokenSymbol === symbol
      ),
    [allPositions, symbol]
  );

  const isLoading =
    isTokenLoading ||
    isOrderBookLoading ||
    isSeriesLoading ||
    isPositionsLoading;
  const error = (() => {
    if (tokenError instanceof Error)
      return tokenError.message;
    if (orderBookError instanceof Error)
      return orderBookError.message;
    if (seriesError instanceof Error)
      return seriesError.message;
    if (!token && !isTokenLoading)
      return "Token not found";
    return null;
  })();

  const [
    isTradeDialogOpen,
    setIsTradeDialogOpen,
  ] = useState(false);
  const [tradeType, setTradeType] =
    useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] =
    useState<"MARKET" | "LIMIT">(
      "MARKET"
    );
  const [amount, setAmount] =
    useState<string>("");
  const [
    limitPriceInput,
    setLimitPriceInput,
  ] = useState<string>("");

  const [view, setView] =
    useState<ChartView>("linea");

  // Favorite state
  const [
    favoriteOverride,
    setFavoriteOverride,
  ] = useState<boolean | null>(null);
  const isFavorite =
    favoriteOverride === null
      ? (token?.isFavorite ?? false)
      : favoriteOverride;

  // Handle favorite toggle
  const handleFavorite = async () => {
    if (!token) return;
    setFavoriteOverride((prev) => {
      if (!token) return prev;
      if (prev === null)
        return !token.isFavorite;
      return !prev;
    });
    // TODO: Call API to toggle favorite on server
    console.log(
      "Toggle favorite for token:",
      token.id
    );
  };

  const price = token?.priceUsd ?? 0;
  const change = token
    ? getChangePct(token, timeframe)
    : 0;
  const isUp = change >= 0;

  const computedSeries = useMemo(() => {
    if (!series) return [];
    if (timeframe === "24h")
      return series.series || [];
    return makeSeries(
      symbol,
      change,
      100
    );
  }, [
    series,
    symbol,
    timeframe,
    change,
  ]);

  const userBalance = useMemo(() => {
    return (
      balances.find(
        (b) => b.currencyCode === "USDT"
      )?.available ?? 0
    );
  }, [balances]);

  const userTokens = useMemo(() => {
    return (
      holdings.find(
        (h) => h.tokenSymbol === symbol
      )?.tokens ?? 0
    );
  }, [holdings, symbol]);

  const userHolding = useMemo(() => {
    const holding = holdings.find(
      (h) => h.tokenSymbol === symbol
    );
    return holding
      ? holding.tokens * price
      : 0;
  }, [holdings, symbol, price]);

  const openOrders = useMemo(() => {
    const relevant = positions.filter(
      (p) =>
        p.tokenSymbol === symbol &&
        (p.status === "OPEN" ||
          p.status ===
            "PARTIALLY_FILLED")
    );
    return relevant.reduce(
      (acc, p) =>
        acc +
        (p.totalAmount -
          p.filledAmount) *
          p.orderPriceUsd,
      0
    );
  }, [positions, symbol]);

  const displaySellPrice =
    useMemo(() => {
      if (
        orderBook?.bids &&
        orderBook.bids.length > 0
      ) {
        return orderBook.bids[
          orderBook.bids.length - 1
        ]!.price;
      }
      return (
        token?.sellPriceUsd ?? price
      );
    }, [orderBook, token, price]);

  const displayBuyPrice =
    useMemo(() => {
      if (
        orderBook?.asks &&
        orderBook.asks.length > 0
      ) {
        return orderBook.asks[0]!.price;
      }
      return (
        token?.buyPriceUsd ?? price
      );
    }, [orderBook, token, price]);

  const marketTradePrice =
    tradeType === "BUY"
      ? displayBuyPrice
      : displaySellPrice;

  const marketSimulation =
    useMemo(() => {
      if (orderType !== "MARKET")
        return null;

      const qty = Number(amount);
      if (
        !Number.isFinite(qty) ||
        qty <= 0
      )
        return null;

      const levels =
        tradeType === "BUY"
          ? (orderBook?.asks ?? [])
          : (orderBook?.bids ?? []);

      let remaining = qty;
      let filled = 0;
      let totalUsd = 0;
      const fills: Array<{
        price: number;
        amount: number;
      }> = [];

      for (const level of levels) {
        if (remaining <= 0) break;
        const take = Math.min(
          remaining,
          level.amount
        );
        if (take <= 0) continue;
        fills.push({
          price: level.price,
          amount: take,
        });
        filled += take;
        totalUsd += take * level.price;
        remaining -= take;
        if (fills.length >= 8) break;
      }

      const avgPrice =
        filled > 0
          ? totalUsd / filled
          : 0;

      return {
        fills,
        filled,
        remaining,
        totalUsd,
        avgPrice,
      };
    }, [
      amount,
      orderBook,
      orderType,
      tradeType,
    ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !token ||
    !orderBook ||
    !series
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive mb-2">
            {error || "Token not found"}
          </p>
          <Button
            onClick={() =>
              router.back()
            }
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleMax = () => {
    if (tradeType === "SELL") {
      setAmount(
        String(userTokens.toFixed(4))
      );
      return;
    }
    const p =
      marketTradePrice > 0
        ? marketTradePrice
        : price;
    const maxByBalance =
      p > 0 ? userBalance / p : 0;
    setAmount(
      String(maxByBalance.toFixed(4))
    );
  };

  return (
    <div className="flex flex-col min-h-full bg-linear-to-b from-gray-900 via-slate-900 to-black duration-500 animate-in fade-in slide-in-from-bottom-4">
      <header className="overflow-hidden sticky top-0 z-50 px-4 pt-3 pb-2 sm:pt-4 sm:pb-3 text-white bg-transparent from-gray-900 rounded-none border-none shadow-xl shrink-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10" />

        <div className="flex relative z-10 gap-4 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.back()
            }
            className="text-white rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1 pr-10 text-center">
            <h1 className="text-[clamp(12px,4.2vw,16px)] font-black tracking-tight leading-none text-white uppercase truncate">
              {token.symbol}
            </h1>
            <p className="text-[9px] sm:text-[10px] italic font-medium text-white/70">
              Mercado de Tokens
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className="text-white rounded-full hover:bg-white/10"
          >
            {isFavorite ? (
              <Star className="w-5 h-5 fill-white" />
            ) : (
              <StarOff className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex flex-col flex-1 min-h-0 p-4 space-y-3">
        <MarketStats
          userHolding={userHolding}
          userBalance={userBalance}
          openOrders={openOrders}
          timeframe={timeframe}
          onTimeframeChange={
            setTimeframe
          }
          token={token}
          getChangePct={getChangePct}
          formatPct={formatPct}
        />

        <div className="flex flex-col flex-1 min-h-[320px] -mx-4 w-[calc(100%+2rem)] bg-linear-to-b from-gray-900 via-slate-900 to-black text-white shadow-inner">
          <div className="flex justify-between items-center p-4 shrink-0">
            <ViewSelector
              view={view}
              onViewChange={setView}
            />
          </div>
          <div className="flex-1 p-3 sm:p-4 min-h-0">
            {view === "linea" ? (
              <LineChart
                series={computedSeries}
                isUp={isUp}
                currentPrice={price}
              />
            ) : view === "velas" ? (
              <CandlesChart
                series={computedSeries}
                isUp={isUp}
                currentPrice={price}
              />
            ) : (
              <OrderBook
                orderBook={orderBook}
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-3 pb-2 sm:pt-4 sm:pb-6 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setTradeType("SELL");
              setOrderType("MARKET");
              setIsTradeDialogOpen(
                true
              );
            }}
            className="flex-1 h-16 sm:h-20 flex-col gap-0.5 text-[11px] sm:text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-pink bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
          >
            <span>VENDER</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-normal normal-case opacity-100">
              {formatPrice(
                displaySellPrice
              )}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTradeType("BUY");
              setOrderType("MARKET");
              setIsTradeDialogOpen(
                true
              );
            }}
            className="flex-1 h-16 sm:h-20 flex-col gap-0.5 text-[11px] sm:text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-green bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
          >
            <span>COMPRAR</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-normal normal-case opacity-100">
              {formatPrice(
                displayBuyPrice
              )}
            </span>
          </Button>
        </div>
      </main>

      <TradeDialog
        isOpen={isTradeDialogOpen}
        onOpenChange={
          setIsTradeDialogOpen
        }
        token={token}
        tradeType={tradeType}
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        amount={amount}
        onAmountChange={setAmount}
        limitPriceInput={
          limitPriceInput
        }
        onLimitPriceInputChange={
          setLimitPriceInput
        }
        userBalance={userBalance}
        userTokens={userTokens}
        marketTradePrice={
          marketTradePrice
        }
        marketSimulation={
          marketSimulation
        }
        onMax={handleMax}
        onConfirm={() => {
          console.log("Confirm trade", {
            tradeType,
            orderType,
            amount,
          });
          setIsTradeDialogOpen(false);
        }}
      />
    </div>
  );
}
