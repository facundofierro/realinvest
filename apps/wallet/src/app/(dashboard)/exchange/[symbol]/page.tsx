"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  ArrowLeft,
  BarChart3,
  CandlestickChart,
  List,
} from "lucide-react";
import type {
  Holding,
  MarketOrderBook,
  MarketToken,
  OrderBookLevel,
  Position,
  WalletBalance,
} from "@/types/wallet";

type Timeframe =
  | "all"
  | "30d"
  | "7d"
  | "24h";
type ChartView =
  | "linea"
  | "velas"
  | "ordenes";

function OrderBook({
  asks,
  bids,
}: {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}) {
  const sortedAsks = asks
    .slice()
    .sort((a, b) => a.price - b.price);
  const sortedBids = bids
    .slice()
    .sort((a, b) => b.price - a.price);

  const askRowsAsc = sortedAsks.reduce<
    Array<
      OrderBookLevel & {
        levelNotional: number;
        cumulativeNotional: number;
      }
    >
  >((acc, level) => {
    const levelNotional =
      level.amount * level.price;
    const prevCum =
      acc.length > 0
        ? acc[acc.length - 1]
            .cumulativeNotional
        : 0;
    acc.push({
      ...level,
      levelNotional,
      cumulativeNotional:
        prevCum + levelNotional,
    });
    return acc;
  }, []);
  const askRows = askRowsAsc
    .slice()
    .reverse();

  const bidRows = sortedBids.reduce<
    Array<
      OrderBookLevel & {
        levelNotional: number;
        cumulativeNotional: number;
      }
    >
  >((acc, level) => {
    const levelNotional =
      level.amount * level.price;
    const prevCum =
      acc.length > 0
        ? acc[acc.length - 1]
            .cumulativeNotional
        : 0;
    acc.push({
      ...level,
      levelNotional,
      cumulativeNotional:
        prevCum + levelNotional,
    });
    return acc;
  }, []);

  const askMax = Math.max(
    1,
    ...askRows.map(
      (a) => a.levelNotional
    )
  );
  const bidMax = Math.max(
    1,
    ...bidRows.map(
      (b) => b.levelNotional
    )
  );

  return (
    <div className="flex gap-4 h-full duration-300 animate-in fade-in zoom-in-95">
      <div className="flex-1 space-y-2">
        <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
          <span>Acum (USDT)</span>
          <span>Precio</span>
        </div>
        {askRows.map((ask, i) => (
          <div
            key={i}
            className="flex relative justify-between items-center h-6 text-xs group"
          >
            <div
              className="absolute top-0 right-0 bottom-0 rounded-l-sm transition-all bg-red-500/10 group-hover:bg-red-500/20"
              style={{
                width: `${(ask.levelNotional / askMax) * 100}%`,
              }}
            />
            <span className="relative z-10 font-mono font-medium text-white/70">
              {formatCompactNumber(
                ask.cumulativeNotional
              )}
            </span>
            <span className="relative z-10 font-mono font-bold text-red-400">
              {ask.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="w-px bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
          <span>Precio</span>
          <span>Acum (USDT)</span>
        </div>
        {bidRows.map((bid, i) => (
          <div
            key={i}
            className="flex relative justify-between items-center h-6 text-xs group"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-r-sm transition-all bg-emerald-500/10 group-hover:bg-emerald-500/20"
              style={{
                width: `${(bid.levelNotional / bidMax) * 100}%`,
              }}
            />
            <span className="relative z-10 font-mono font-bold text-emerald-400">
              {bid.price.toFixed(2)}
            </span>
            <span className="relative z-10 font-mono font-medium text-white/70">
              {formatCompactNumber(
                bid.cumulativeNotional
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPct(
  value: number
): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

function formatCompactNumber(
  value: number
): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    const n = abs / 1_000_000_000;
    const s = n
      .toFixed(1)
      .replace(/\.0$/, "");
    return `${sign}${s}B`;
  }
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    const s = n
      .toFixed(1)
      .replace(/\.0$/, "");
    return `${sign}${s}M`;
  }
  return `${sign}${Math.round(abs).toLocaleString()}`;
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
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
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
      label: `$${getRealPrice((max + min) / 2).toFixed(2)}`,
    },
  ];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full"
    >
      <defs>
        <linearGradient
          id="lineStroke"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor={
              isUp
                ? "#10b981"
                : "#ec4899"
            }
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="#8b5cf6"
            stopOpacity="1"
          />
        </linearGradient>
        <linearGradient
          id="areaFill"
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={
              isUp
                ? "#10b981"
                : "#ec4899"
            }
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            stopColor="#8b5cf6"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {labels.map((l, i) => {
        const y =
          h -
          padBottom -
          ((l.val - min) /
            Math.max(1e-6, max - min)) *
            (h - padTop - padBottom);
        return (
          <g key={i}>
            <line
              x1="0"
              y1={y}
              x2={w - padRight}
              y2={y}
              stroke="currentColor"
              className="text-border/30"
              strokeDasharray="4 4"
            />
            <text
              x={w - padRight + 4}
              y={y + 3}
              className="text-[9px] font-bold fill-muted-foreground"
            >
              {l.label}
            </text>
          </g>
        );
      })}

      <path
        d={`${d} L ${w - padRight} ${h - padBottom} L 0 ${h - padBottom} Z`}
        fill="url(#areaFill)"
      />
      <path
        d={d}
        fill="none"
        stroke="url(#lineStroke)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CandlesChart({
  series,
  currentPrice,
}: {
  series: number[];
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

  const scaleY = (val: number) =>
    h -
    padBottom -
    ((val - min) /
      Math.max(1e-6, max - min)) *
      (h - padTop - padBottom);

  const labels = [
    {
      val: max,
      label: `$${getRealPrice(max).toFixed(2)}`,
    },
    {
      val: min,
      label: `$${getRealPrice(min).toFixed(2)}`,
    },
  ];

  const candles = series
    .slice(1)
    .map((v, i) => {
      const prev = series[i];
      const open = prev;
      const close = v;
      const diff = Math.abs(
        close - open
      );
      const high =
        Math.max(open, close) +
        diff * 0.4;
      const low =
        Math.min(open, close) -
        diff * 0.4;
      const x =
        ((i + 1) /
          Math.max(
            1,
            series.length - 1
          )) *
        (w - padRight);

      return {
        x,
        yOpen: scaleY(open),
        yClose: scaleY(close),
        yHigh: scaleY(high),
        yLow: scaleY(low),
        up: close >= open,
        color:
          close >= open
            ? "#10b981"
            : "#ec4899",
      };
    });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full"
    >
      {/* Grid Lines */}
      {labels.map((l, i) => {
        const y = scaleY(l.val);
        return (
          <g key={i}>
            <line
              x1="0"
              y1={y}
              x2={w - padRight}
              y2={y}
              stroke="currentColor"
              className="text-border/30"
              strokeDasharray="4 4"
            />
            <text
              x={w - padRight + 4}
              y={y + 3}
              className="text-[9px] font-bold fill-muted-foreground"
            >
              {l.label}
            </text>
          </g>
        );
      })}

      {candles.map((c, idx) => {
        const bodyTop = Math.min(
          c.yOpen,
          c.yClose
        );
        const bodyBottom = Math.max(
          c.yOpen,
          c.yClose
        );
        const bodyH = Math.max(
          2,
          bodyBottom - bodyTop
        );
        const bodyW = 5;
        return (
          <g key={idx}>
            <line
              x1={c.x}
              x2={c.x}
              y1={c.yHigh}
              y2={c.yLow}
              stroke={c.color}
              strokeWidth="1.5"
              opacity="0.8"
            />
            <rect
              x={c.x - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={c.color}
              opacity={0.9}
              rx="1"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function ExchangeTokenPage() {
  const params = useParams<{
    symbol: string;
  }>();
  const router = useRouter();
  const symbol = decodeURIComponent(
    params.symbol
  );

  const [timeframe, setTimeframe] =
    useState<Timeframe>("all");
  const [view, setView] =
    useState<ChartView>("linea");
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

  const [token, setToken] =
    useState<MarketToken | null>(null);
  const [balances, setBalances] =
    useState<WalletBalance[]>([]);
  const [holdings, setHoldings] =
    useState<Holding[]>([]);
  const [positions, setPositions] =
    useState<Position[]>([]);
  const [orderBook, setOrderBook] =
    useState<MarketOrderBook | null>(
      null
    );
  const [series, setSeries] = useState<
    number[] | null
  >(null);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  useEffect(() => {
    const controller =
      new AbortController();

    async function load() {
      try {
        setLoadError(null);

        const [
          tokensRes,
          balancesRes,
          holdingsRes,
          positionsRes,
          orderBookRes,
        ] = await Promise.all([
          fetch("/api/market/tokens", {
            signal: controller.signal,
          }),
          fetch(
            "/api/wallet/balances",
            {
              signal: controller.signal,
            }
          ),
          fetch(
            "/api/wallet/holdings",
            {
              signal: controller.signal,
            }
          ),
          fetch(
            "/api/wallet/positions",
            {
              signal: controller.signal,
            }
          ),
          fetch(
            `/api/market/orderbook?symbol=${encodeURIComponent(
              symbol
            )}`,
            {
              signal: controller.signal,
            }
          ),
        ]);

        if (!tokensRes.ok)
          throw new Error(
            "Failed to load tokens"
          );
        if (!balancesRes.ok)
          throw new Error(
            "Failed to load balances"
          );
        if (!holdingsRes.ok)
          throw new Error(
            "Failed to load holdings"
          );
        if (!positionsRes.ok)
          throw new Error(
            "Failed to load positions"
          );
        if (!orderBookRes.ok)
          throw new Error(
            "Failed to load order book"
          );

        const tokensJson =
          (await tokensRes.json()) as {
            tokens: MarketToken[];
          };
        const balancesJson =
          (await balancesRes.json()) as {
            balances: WalletBalance[];
          };
        const holdingsJson =
          (await holdingsRes.json()) as {
            holdings: Holding[];
          };
        const positionsJson =
          (await positionsRes.json()) as {
            positions: Position[];
          };
        const orderBookJson =
          (await orderBookRes.json()) as MarketOrderBook;

        const nextToken =
          tokensJson.tokens.find(
            (t) => t.symbol === symbol
          ) ?? null;

        setToken(nextToken);
        setBalances(
          balancesJson.balances ?? []
        );
        setHoldings(
          holdingsJson.holdings ?? []
        );
        setPositions(
          positionsJson.positions ?? []
        );
        setOrderBook(orderBookJson);
      } catch (error) {
        if (controller.signal.aborted)
          return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load data"
        );
      }
    }

    void load();
    return () => controller.abort();
  }, [symbol]);

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadSeries() {
      try {
        const res = await fetch(
          `/api/market/series?symbol=${encodeURIComponent(
            symbol
          )}&timeframe=${encodeURIComponent(
            timeframe
          )}&points=34`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error(
            "Failed to load series"
          );

        const json =
          (await res.json()) as {
            series: number[];
          };
        setSeries(json.series ?? null);
      } catch {
        if (controller.signal.aborted)
          return;
        setSeries(null);
      }
    }

    void loadSeries();
    return () => controller.abort();
  }, [symbol, timeframe]);

  const effectiveToken: MarketToken =
    token ?? {
      id: symbol,
      symbol,
      projectId: "-",
      projectTitle: "-",
      priceUsd: 0,
      marketCapUsd: 0,
      change24hPct: 0,
      change7dPct: 0,
      change30dPct: 0,
      changeAllPct: 0,
      liveSince: "-",
      isFavorite: false,
    };

  const changePct = getChangePct(
    effectiveToken,
    timeframe
  );
  const isUp = changePct >= 0;
  const price = effectiveToken.priceUsd;
  const chartSeries =
    series ??
    Array.from({ length: 34 }).map(
      () => 100
    );
  const { asks, bids } = useMemo(() => {
    return {
      asks: orderBook?.asks ?? [],
      bids: orderBook?.bids ?? [],
    };
  }, [orderBook]);

  const userBalance = useMemo(
    () =>
      balances.find(
        (b) => b.currencyCode === "USDT"
      )?.available ?? 0,
    [balances]
  );

  const userHolding = useMemo(() => {
    const holding = holdings.find(
      (h) => h.tokenSymbol === symbol
    );
    return holding
      ? holding.tokens * price
      : 0;
  }, [holdings, symbol, price]);

  const openOrders = useMemo(() => {
    const active = positions.filter(
      (p) =>
        p.tokenSymbol === symbol &&
        (p.status === "OPEN" ||
          p.status ===
            "PARTIALLY_FILLED")
    );
    return active.reduce(
      (acc, p) =>
        acc +
        (p.totalAmount -
          p.filledAmount) *
          p.orderPriceUsd,
      0
    );
  }, [positions, symbol]);

  const bestAsk = useMemo(() => {
    if (asks.length === 0) return null;
    const best = Math.min(
      ...asks.map((a) => a.price)
    );
    return Number.isFinite(best)
      ? best
      : null;
  }, [asks]);

  const bestBid = useMemo(() => {
    if (bids.length === 0) return null;
    const best = Math.max(
      ...bids.map((b) => b.price)
    );
    return Number.isFinite(best)
      ? best
      : null;
  }, [bids]);

  return (
    <div className="flex flex-col h-[100dvh] -mb-24 pb-24 bg-linear-to-b from-gray-900 via-slate-900 to-black duration-500 animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
      <header className="overflow-hidden sticky top-0 z-50 px-4 pt-4 pb-3 text-white bg-transparent from-gray-900 rounded-none border-none shadow-xl shrink-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10"></div>

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
              {effectiveToken.symbol}
            </h1>
            <p className="text-[10px] italic font-medium text-white/70">
              Mercado de Tokens
            </p>
          </div>
        </div>
      </header>

      <main className="flex overflow-hidden flex-col flex-1 p-4 space-y-3">
        {loadError && (
          <div className="p-4 text-sm text-center rounded-3xl border border-dashed text-white/70 bg-white/5 border-white/10">
            {loadError}
          </div>
        )}
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
                effectiveToken,
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
                series={chartSeries}
                isUp={isUp}
                currentPrice={price}
              />
            ) : view === "velas" ? (
              <CandlesChart
                series={chartSeries}
                currentPrice={price}
              />
            ) : (
              <OrderBook
                asks={asks}
                bids={bids}
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 pb-6 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setTradeType("SELL");
              setIsTradeDialogOpen(
                true
              );
            }}
            className="flex-1 h-20 flex-col gap-0.5 text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-pink bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
          >
            <span>VENDER</span>
            <span className="text-3xl font-bold tracking-normal normal-case opacity-100">
              $
              {(
                bestBid ??
                effectiveToken.sellPriceUsd ??
                price
              ).toFixed(2)}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTradeType("BUY");
              setIsTradeDialogOpen(
                true
              );
            }}
            className="flex-1 h-20 flex-col gap-0.5 text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-green bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
          >
            <span>COMPRAR</span>
            <span className="text-3xl font-bold tracking-normal normal-case opacity-100">
              $
              {(
                bestAsk ??
                effectiveToken.buyPriceUsd ??
                price
              ).toFixed(2)}
            </span>
          </Button>
        </div>

        <Dialog
          open={isTradeDialogOpen}
          onOpenChange={
            setIsTradeDialogOpen
          }
        >
          <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-6 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tight uppercase">
                  {tradeType === "BUY"
                    ? "Comprar"
                    : "Vender"}{" "}
                  {
                    effectiveToken.symbol
                  }
                </DialogTitle>
              </DialogHeader>

              <Tabs
                value={orderType}
                onValueChange={(v) =>
                  setOrderType(
                    v as
                      | "MARKET"
                      | "LIMIT"
                  )
                }
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="MARKET">
                    Mercado
                  </TabsTrigger>
                  <TabsTrigger value="LIMIT">
                    Orden
                  </TabsTrigger>
                </TabsList>

                <div className="py-4 space-y-4">
                  {orderType ===
                  "MARKET" ? (
                    <p className="text-sm text-muted-foreground">
                      Operar al precio
                      actual del
                      mercado. La orden
                      se ejecutará
                      inmediatamente al
                      mejor precio
                      disponible.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Establece un
                      precio específico
                      para comprar o
                      vender. La orden
                      se ejecutará solo
                      cuando el mercado
                      alcance tu precio.
                    </p>
                  )}

                  <div className="space-y-4">
                    {orderType ===
                      "LIMIT" && (
                      <div className="space-y-2">
                        <Label>
                          Precio
                          Objetivo (
                          {
                            token?.symbol
                          }
                          )
                        </Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="h-12 rounded-xl"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>
                        Cantidad
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    className="mt-6 w-full h-12 text-xs font-black tracking-widest uppercase rounded-xl shadow-xl bg-primary text-primary-foreground shadow-primary/25"
                    size="lg"
                    onClick={() =>
                      setIsTradeDialogOpen(
                        false
                      )
                    }
                  >
                    {tradeType === "BUY"
                      ? "Confirmar Compra"
                      : "Confirmar Venta"}
                  </Button>
                </div>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
