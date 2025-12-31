"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { UnitDetailsSheet } from "@/components/unit-details-sheet";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  ArrowLeft,
  BarChart3,
  CandlestickChart,
  List,
  Star,
  StarOff,
} from "lucide-react";
import type {
  Holding,
  MarketOrderBook,
  MarketSeries,
  MarketToken,
  Position,
  WalletBalance,
} from "@/types/wallet";
import {
  getMarketTokenBySymbol,
  getMarketOrderBook,
  getMarketSeries,
  getWalletBalances,
  getWalletHoldings,
  getWalletPositions,
} from "@/lib/api-client";

type Timeframe =
  | "all"
  | "30d"
  | "7d"
  | "24h";
type ChartView =
  | "linea"
  | "velas"
  | "ordenes";

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

function LineChart({
  series,
  isUp,
  currentPrice,
}: {
  series: number[];
  isUp: boolean;
  currentPrice: number;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const w = 320;
  const h = 200;
  const padRight = 45;
  const padTop = 10;
  const padBottom = 10;

  const getRealPrice = (
    val: number
  ) => {
    const lastVal =
      series[series.length - 1];
    return (
      (val / lastVal) * currentPrice
    );
  };

  const d = series
    .map((v, i) => {
      const x =
        (i /
          Math.max(
            1,
            series.length - 1
          )) *
        (w - padRight);
      const y =
        h -
        padBottom -
        ((v - min) /
          Math.max(1e-6, max - min)) *
          (h - padTop - padBottom);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(
        2
      )} ${y.toFixed(2)}`;
    })
    .join(" ");

  const labels = [
    {
      val: max,
      label: `$${getRealPrice(max).toFixed(2)}`,
    },
    {
      val: min,
      label: `$${getRealPrice(min).toFixed(2)}`,
    },
    {
      val: (max + min) / 2,
      label: `$${getRealPrice(
        (max + min) / 2
      ).toFixed(2)}`,
    },
  ];

  return (
    <div className="flex justify-center items-center w-full h-full duration-300 animate-in fade-in zoom-in-95">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="lineGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor={
                isUp
                  ? "#66c919"
                  : "#ff3366"
              }
              stopOpacity="0.9"
            />
            <stop
              offset="100%"
              stopColor={
                isUp
                  ? "#27ae8a"
                  : "#ff3366"
              }
              stopOpacity="0.9"
            />
          </linearGradient>
          <linearGradient
            id="areaGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={
                isUp
                  ? "#66c919"
                  : "#ff3366"
              }
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor={
                isUp
                  ? "#27ae8a"
                  : "#ff3366"
              }
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path
          d={`${d} L ${w - padRight} ${
            h - padBottom
          } L 0 ${h - padBottom} Z`}
          fill="url(#areaGradient)"
        />
        <path
          d={d}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {labels.map((l, idx) => {
          const y =
            h -
            padBottom -
            ((l.val - min) /
              Math.max(
                1e-6,
                max - min
              )) *
              (h - padTop - padBottom);
          return (
            <g key={idx}>
              <line
                x1={0}
                y1={y}
                x2={w - padRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3,4"
              />
              <text
                x={w - padRight + 4}
                y={y + 3}
                fontSize="10"
                fill="rgba(255,255,255,0.55)"
                fontFamily="ui-monospace, SFMono-Regular"
              >
                {l.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CandlesChart({
  series,
  isUp,
  currentPrice,
}: {
  series: number[];
  isUp: boolean;
  currentPrice: number;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const w = 320;
  const h = 200;
  const padTop = 10;
  const padBottom = 10;
  const candles = 28;
  const step = Math.max(
    1,
    Math.floor(series.length / candles)
  );
  const sample = Array.from({
    length: candles,
  }).map((_, i) => {
    const start = i * step;
    const end = Math.min(
      series.length,
      (i + 1) * step
    );
    const chunk = series.slice(
      start,
      end
    );
    const open = chunk[0] ?? series[0];
    const close =
      chunk.at(-1) ??
      series.at(-1) ??
      open;
    const high = Math.max(...chunk);
    const low = Math.min(...chunk);
    return { open, close, high, low };
  });

  const getRealPrice = (
    val: number
  ) => {
    const lastVal =
      series[series.length - 1];
    return (
      (val / lastVal) * currentPrice
    );
  };

  const yFromVal = (v: number) =>
    h -
    padBottom -
    ((v - min) /
      Math.max(1e-6, max - min)) *
      (h - padTop - padBottom);

  const candleW = w / sample.length;

  return (
    <div className="flex justify-center items-center w-full h-full duration-300 animate-in fade-in zoom-in-95">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {sample.map((c, i) => {
          const x =
            i * candleW +
            candleW * 0.25;
          const bodyW = candleW * 0.5;
          const openY = yFromVal(
            c.open
          );
          const closeY = yFromVal(
            c.close
          );
          const highY = yFromVal(
            c.high
          );
          const lowY = yFromVal(c.low);
          const up = c.close >= c.open;
          const color = up
            ? "#27b944"
            : "#ff3366";
          const top = Math.min(
            openY,
            closeY
          );
          const bottom = Math.max(
            openY,
            closeY
          );
          const bodyH = Math.max(
            2,
            bottom - top
          );

          return (
            <g key={i}>
              <line
                x1={x + bodyW / 2}
                y1={highY}
                x2={x + bodyW / 2}
                y2={lowY}
                stroke={color}
                strokeOpacity={0.65}
                strokeWidth={2}
              />
              <rect
                x={x}
                y={top}
                width={bodyW}
                height={bodyH}
                rx={2}
                fill={color}
                fillOpacity={0.85}
              />
            </g>
          );
        })}

        <text
          x={8}
          y={16}
          fontSize="10"
          fill="rgba(255,255,255,0.55)"
          fontFamily="ui-monospace, SFMono-Regular"
        >
          $
          {getRealPrice(max).toFixed(2)}
        </text>
        <text
          x={8}
          y={h - 6}
          fontSize="10"
          fill="rgba(255,255,255,0.55)"
          fontFamily="ui-monospace, SFMono-Regular"
        >
          $
          {getRealPrice(min).toFixed(2)}
        </text>

        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill="transparent"
          stroke={
            isUp
              ? "rgba(102,201,25,0.15)"
              : "rgba(255,51,102,0.15)"
          }
        />
      </svg>
    </div>
  );
}

function OrderBook({
  orderBook,
}: {
  orderBook: MarketOrderBook;
}) {
  const asks = orderBook.asks.slice(
    0,
    6
  );
  const bids = orderBook.bids.slice(
    0,
    6
  );

  const asksAcc = asks.reduce(
    (state, a) => {
      const accumulated =
        state.total + a.amount;
      return {
        total: accumulated,
        list: [
          ...state.list,
          { ...a, accumulated },
        ],
      };
    },
    {
      total: 0,
      list: [] as Array<
        MarketOrderBook["asks"][number] & {
          accumulated: number;
        }
      >,
    }
  );
  const asksWithWidth =
    asksAcc.list.map((a) => ({
      ...a,
      width:
        (a.accumulated /
          (asksAcc.total || 1)) *
        100,
    }));

  const bidsAcc = [...bids]
    .reverse()
    .reduce(
      (state, b) => {
        const accumulated =
          state.total + b.amount;
        return {
          total: accumulated,
          list: [
            ...state.list,
            { ...b, accumulated },
          ],
        };
      },
      {
        total: 0,
        list: [] as Array<
          MarketOrderBook["bids"][number] & {
            accumulated: number;
          }
        >,
      }
    );
  const bidsWithWidth =
    bidsAcc.list.map((b) => ({
      ...b,
      width:
        (b.accumulated /
          (bidsAcc.total || 1)) *
        100,
    }));

  return (
    <div className="flex gap-4 h-full duration-300 animate-in fade-in zoom-in-95">
      <div className="flex-1 space-y-2">
        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest text-right">
          Precio (USDT)
        </div>
        {asksWithWidth.map((ask, i) => (
          <div
            key={i}
            className="flex relative justify-between items-center h-6 text-xs group"
          >
            <div
              className="absolute top-0 right-0 bottom-0 rounded-l-sm transition-all bg-red-500/10 group-hover:bg-red-500/20"
              style={{
                width: `${ask.width}%`,
              }}
            />
            <span className="relative z-10 font-mono font-medium text-white/70">
              {ask.accumulated}
            </span>
            <span className="relative z-10 font-mono font-bold text-red-400">
              {ask.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="w-px bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">
          Precio (USDT)
        </div>
        {bidsWithWidth.map((bid, i) => (
          <div
            key={i}
            className="flex relative justify-between items-center h-6 text-xs group"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-r-sm transition-all bg-emerald-500/10 group-hover:bg-emerald-500/20"
              style={{
                width: `${bid.width}%`,
              }}
            />
            <span className="relative z-10 font-mono font-bold text-emerald-400">
              {bid.price.toFixed(2)}
            </span>
            <span className="relative z-10 font-mono font-medium text-white/70">
              {bid.accumulated}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ExchangeDetailPageProps {
  symbol: string;
}

export default function ExchangeDetailPage({
  symbol,
}: ExchangeDetailPageProps) {
  const router = useRouter();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [token, setToken] = useState<MarketToken | null>(null);
  const [orderBook, setOrderBook] = useState<MarketOrderBook | null>(null);
  const [series, setSeries] = useState<MarketSeries | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // Fetch data on mount or when symbol changes
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [
          tokenData,
          orderBookData,
          seriesData,
          positionsData,
          balancesData,
          holdingsData,
        ] = await Promise.all([
          getMarketTokenBySymbol(symbol),
          getMarketOrderBook(symbol),
          getMarketSeries(symbol, "24h", 100),
          getWalletPositions(),
          getWalletBalances(),
          getWalletHoldings(),
        ]);

        if (!isMounted) return;

        if (!tokenData) {
          setError("Token not found");
          return;
        }

        setToken(tokenData);
        setOrderBook(orderBookData);
        setSeries(seriesData);
        setPositions(positionsData.filter((p) => p.tokenSymbol === symbol));
        setBalances(balancesData);
        setHoldings(holdingsData);
      } catch (err) {
        if (!isMounted) return;
        setError("Error loading token data");
        console.error("Failed to fetch exchange data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [symbol]);

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

  const [timeframe, setTimeframe] =
    useState<Timeframe>("24h");
  const [view, setView] =
    useState<ChartView>("linea");

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  // Update favorite state when token is loaded
  useEffect(() => {
    if (token) {
      setIsFavorite(token.isFavorite);
    }
  }, [token]);

  // Handle favorite toggle
  const handleFavorite = async () => {
    if (!token) return;
    setIsFavorite(!isFavorite);
    // TODO: Call API to toggle favorite on server
    console.log("Toggle favorite for token:", token.id);
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !token || !orderBook || !series) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive mb-2">
            {error || "Token not found"}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const price = token.priceUsd;
  const change = getChangePct(
    token,
    timeframe
  );
  const isUp = change >= 0;

  const computedSeries = useMemo(() => {
    if (timeframe === "24h")
      return series.series;
    return makeSeries(
      symbol,
      change,
      100
    );
  }, [
    series.series,
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
      if (orderBook.bids.length > 0) {
        // Returns the price of the first bid displayed in the UI (lowest bid price)
        return orderBook.bids[
          orderBook.bids.length - 1
        ].price;
      }
      return (
        token.sellPriceUsd ?? price
      );
    }, [
      orderBook.bids,
      token.sellPriceUsd,
      price,
    ]);

  const displayBuyPrice =
    useMemo(() => {
      if (orderBook.asks.length > 0) {
        // Returns the price of the first ask displayed in the UI (lowest ask price)
        return orderBook.asks[0].price;
      }
      return token.buyPriceUsd ?? price;
    }, [
      orderBook.asks,
      token.buyPriceUsd,
      price,
    ]);

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
          ? orderBook.asks
          : orderBook.bids;

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
      orderBook.asks,
      orderBook.bids,
      orderType,
      tradeType,
    ]);

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
    <div className="flex flex-col h-[100dvh] -mb-24 pb-24 bg-linear-to-b from-gray-900 via-slate-900 to-black duration-500 animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
      <header className="overflow-hidden sticky top-0 z-50 px-4 pt-4 pb-3 text-white bg-transparent from-gray-900 rounded-none border-none shadow-xl shrink-0">
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
            <h1 className="text-xl font-black tracking-tight leading-none text-white uppercase">
              {token.symbol}
            </h1>
            <p className="text-[10px] italic font-medium text-white/70">
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

      <main className="flex overflow-hidden flex-col flex-1 p-4 space-y-3">
        <Card className="overflow-hidden border-none shadow-sm bg-white shrink-0 rounded-[32px]">
          <div className="flex gap-4 justify-between items-start p-5">
            <div className="flex gap-6 justify-around items-center w-full">
              <div className="space-y-0.5 text-center">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  TENENCIA
                </div>
                <div className="text-xl font-black tracking-tighter text-[#3B2146]">
                  $
                  {userHolding.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="space-y-0.5 text-center">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  LIQUIDEZ
                </div>
                <div className="text-xl font-black tracking-tighter text-[#3B2146]">
                  $
                  {userBalance.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="space-y-0.5 text-center">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  ORDENES
                </div>
                <div className="text-xl font-black tracking-tighter text-[#3B2146]">
                  $
                  {openOrders.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 px-4 pb-5">
            {(
              [
                ["ALL", "all"],
                ["30D", "30d"],
                ["7D", "7d"],
                ["24H", "24h"],
              ] as const
            ).map(([label, tf]) => {
              const v = getChangePct(
                token,
                tf
              );
              const up = v >= 0;
              const isSelected =
                timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() =>
                    setTimeframe(tf)
                  }
                  className={cn(
                    "h-[52px] rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center",
                    isSelected
                      ? "bg-primary/20 text-primary border-primary/20 shadow-lg shadow-primary/5 scale-[1.05] z-10"
                      : "bg-primary/5 border-primary/10 text-primary hover:bg-primary/10"
                  )}
                >
                  <span className="block leading-none">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 px-2 py-1 rounded-[10px] text-[10px] font-black inline-block shadow-sm text-white border-none min-w-[50px]",
                      up
                        ? "bg-linear-to-r from-brand-lime via-brand-green to-brand-teal shadow-brand-green/20"
                        : "bg-[#FF3366] shadow-brand-pink/20"
                    )}
                  >
                    {formatPct(v)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col flex-1 min-h-0 -mx-4 w-[calc(100%+2rem)] bg-linear-to-b from-gray-900 via-slate-900 to-black text-white shadow-inner">
          <div className="flex justify-between items-center p-4 shrink-0">
            <div className="flex gap-2 p-1 w-full rounded-2xl border backdrop-blur-md bg-white/5 border-white/10">
              <button
                type="button"
                onClick={() =>
                  setView("linea")
                }
                className={cn(
                  "flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "linea"
                    ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                LÍNEA
              </button>
              <button
                type="button"
                onClick={() =>
                  setView("velas")
                }
                className={cn(
                  "flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "velas"
                    ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <CandlestickChart className="w-4 h-4" />
                VELAS
              </button>
              <button
                type="button"
                onClick={() =>
                  setView("ordenes")
                }
                className={cn(
                  "flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "ordenes"
                    ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <List className="w-4 h-4" />
                ORDENES
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 min-h-0">
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

        <div className="flex gap-3 pt-4 pb-6 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setTradeType("SELL");
              setOrderType("MARKET");
              setIsTradeDialogOpen(
                true
              );
            }}
            className="flex-1 h-20 flex-col gap-0.5 text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-pink bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
          >
            <span>VENDER</span>
            <span className="text-3xl font-bold tracking-normal normal-case opacity-100">
              $
              {displaySellPrice.toFixed(
                2
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
            className="flex-1 h-20 flex-col gap-0.5 text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-green bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
          >
            <span>COMPRAR</span>
            <span className="text-3xl font-bold tracking-normal normal-case opacity-100">
              $
              {displayBuyPrice.toFixed(
                2
              )}
            </span>
          </Button>
        </div>
      </main>

      <UnitDetailsSheet
        isOpen={isTradeDialogOpen}
        onClose={() =>
          setIsTradeDialogOpen(false)
        }
        isExpanded={true}
        symbol={token.symbol}
        title={token.projectTitle}
        price={token.priceUsd}
        stockText={
          tradeType === "BUY"
            ? `SALDO: $${userBalance.toFixed(2)}`
            : `DISPONIBLE: ${userTokens.toFixed(2)} ${token.symbol}`
        }
        features={
          <span className="flex gap-1 items-center text-xs text-foreground/80 font-black">
            {tradeType === "BUY"
              ? "COMPRAR"
              : "VENDER"}
          </span>
        }
        actions={
          <Button
            className="w-full h-14 text-xs font-black tracking-widest uppercase rounded-xl shadow-xl bg-primary text-primary-foreground shadow-primary/25"
            size="lg"
            onClick={() =>
              setIsTradeDialogOpen(
                false
              )
            }
          >
            {tradeType === "BUY"
              ? "CONFIRMAR COMPRA"
              : "CONFIRMAR VENTA"}
          </Button>
        }
      >
        <div className="pb-4">
          <Tabs
            value={orderType}
            onValueChange={(v) =>
              setOrderType(
                v as "MARKET" | "LIMIT"
              )
            }
          >
            <TabsList className="grid grid-cols-2 p-1 w-full rounded-full bg-muted/20">
              <TabsTrigger
                value="MARKET"
                className="rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Mercado
              </TabsTrigger>
              <TabsTrigger
                value="LIMIT"
                className="rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Orden
              </TabsTrigger>
            </TabsList>

            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>
                    Detalles de la
                    operación
                  </Label>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Max:{" "}
                    {tradeType ===
                    "SELL"
                      ? userTokens.toFixed(
                          2
                        )
                      : `$${userBalance.toFixed(2)}`}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Cantidad
                    </span>
                    <Input
                      value={amount}
                      onChange={(e) =>
                        setAmount(
                          e.target.value
                        )
                      }
                      type="number"
                      placeholder="0.00"
                      className="h-12 font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {orderType ===
                      "MARKET"
                        ? "Precio Aprox."
                        : "Precio Límite"}
                    </span>
                    {orderType ===
                    "MARKET" ? (
                      <div className="flex items-center px-3 h-12 font-bold truncate rounded-xl border bg-muted/20 border-border/50 text-muted-foreground">
                        $
                        {(
                          marketSimulation?.avgPrice ||
                          marketTradePrice
                        ).toFixed(2)}
                      </div>
                    ) : (
                      <Input
                        value={
                          limitPriceInput
                        }
                        onChange={(e) =>
                          setLimitPriceInput(
                            e.target
                              .value
                          )
                        }
                        type="number"
                        placeholder="0.00"
                        className="h-12 font-bold rounded-xl"
                      />
                    )}
                  </div>
                </div>

                {orderType ===
                  "MARKET" &&
                  marketSimulation &&
                  marketSimulation.fills
                    .length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/10">
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Órdenes
                          ejecutadas
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Prom: $
                          {marketSimulation.avgPrice.toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="divide-y divide-border/40">
                        {marketSimulation.fills.map(
                          (
                            fill,
                            idx
                          ) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center px-4 py-2"
                            >
                              <span
                                className={cn(
                                  "font-mono text-xs font-bold",
                                  tradeType ===
                                    "BUY"
                                    ? "text-red-400"
                                    : "text-emerald-400"
                                )}
                              >
                                $
                                {fill.price.toFixed(
                                  2
                                )}
                              </span>
                              <span className="font-mono text-xs font-medium text-muted-foreground">
                                {fill.amount.toFixed(
                                  4
                                )}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>
                          Total
                        </span>
                        <span>
                          $
                          {marketSimulation.totalUsd.toFixed(
                            2
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                {orderType ===
                  "MARKET" &&
                  marketSimulation &&
                  marketSimulation.remaining >
                    0 && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-pink">
                      Liquidez
                      insuficiente:
                      faltan{" "}
                      {marketSimulation.remaining.toFixed(
                        4
                      )}{" "}
                      {token.symbol}
                    </div>
                  )}
              </div>
            </div>
          </Tabs>
        </div>
      </UnitDetailsSheet>
    </div>
  );
}
