"use client";

import {
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
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  BarChart3,
  CandlestickChart,
} from "lucide-react";
import marketTokens from "@/sample-data/marketTokens.json";
import type { MarketToken } from "@/types/wallet";

type Timeframe =
  | "all"
  | "30d"
  | "7d"
  | "24h";
type ChartView = "linea" | "velas";

function formatPct(
  value: number
): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
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

  const token = useMemo(() => {
    const list =
      marketTokens as MarketToken[];
    return (
      list.find(
        (t) => t.symbol === symbol
      ) ?? {
        id: symbol,
        symbol,
        projectId: "1",
        projectTitle: "Proyecto",
        priceUsd: 0,
        marketCapUsd: 0,
        change24hPct: 0,
        change7dPct: 0,
        change30dPct: 0,
        changeAllPct: 0,
        liveSince: "-",
        isFavorite: false,
      }
    );
  }, [symbol]);

  const [timeframe, setTimeframe] =
    useState<Timeframe>("all");
  const [view, setView] =
    useState<ChartView>("linea");

  const changePct = getChangePct(
    token,
    timeframe
  );
  const isUp = changePct >= 0;
  const series = useMemo(
    () =>
      makeSeries(symbol, changePct, 34),
    [symbol, changePct]
  );
  const price = token.priceUsd;

  return (
    <div className="flex flex-col h-[calc(100dvh-96px)] bg-[#F8F9FA] duration-500 animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
      <header className="overflow-hidden sticky top-0 z-50 px-4 pt-4 pb-3 text-white from-gray-900 rounded-none border-none shadow-xl bg-linear-to-br via-slate-900 to-violet-950 shrink-0">
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
              {token.symbol}
            </h1>
            <p className="text-[10px] italic font-medium text-white/70">
              Mercado de Tokens
            </p>
          </div>
        </div>
      </header>

      <main className="flex overflow-hidden flex-col flex-1 p-4 space-y-3">
        <Card className="overflow-hidden border-none shadow-sm bg-white shrink-0 rounded-[32px]">
          <div className="flex gap-4 justify-between items-start p-5">
            <div className="flex gap-6 items-center">
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  COMPRA
                </div>
                <div className="text-2xl font-black tracking-tighter text-[#3B2146]">
                  $
                  {(
                    token.buyPriceUsd ??
                    price
                  ).toFixed(2)}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  VENTA
                </div>
                <div className="text-2xl font-black tracking-tighter text-[#3B2146]">
                  $
                  {(
                    token.sellPriceUsd ??
                    price
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center">
                {timeframe === "all"
                  ? "HISTÓRICO"
                  : timeframe === "30d"
                    ? "30 DÍAS"
                    : timeframe === "7d"
                      ? "7 DÍAS"
                      : "24 HORAS"}
              </div>
              <div
                className={cn(
                  "px-4 py-2.5 text-right transition-all rounded-[20px] flex flex-col items-center justify-center min-w-[90px] shadow-lg",
                  isUp
                    ? "bg-linear-to-r from-brand-lime via-brand-green to-brand-teal shadow-brand-green/20"
                    : "bg-[#FF3366] shadow-brand-pink/20"
                )}
              >
                <div className="flex gap-1.5 justify-center items-center">
                  <span className="text-xl font-black leading-none text-white">
                    {formatPct(
                      changePct
                    ).replace("+", "")}
                  </span>
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
                      ? "bg-primary/80 text-white border-primary shadow-lg shadow-primary/20 scale-[1.05] z-10"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  )}
                >
                  <span className="block leading-none">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 px-1.5 py-0.5 rounded-md text-[8px] font-black inline-block border",
                      up
                        ? cn(
                            "text-brand-green",
                            isSelected
                              ? "bg-green-100 border-green-200"
                              : "bg-brand-green/10 border-brand-green/20"
                          )
                        : cn(
                            "text-brand-pink",
                            isSelected
                              ? "bg-pink-100 border-pink-200"
                              : "bg-brand-pink/10 border-brand-pink/20"
                          )
                    )}
                  >
                    {formatPct(v)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex overflow-hidden flex-col flex-1 min-h-0 border-none shadow-sm bg-white rounded-[32px]">
          <div className="flex justify-between items-center p-3 shrink-0">
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() =>
                  setView("linea")
                }
                className={cn(
                  "flex-1 h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "linea"
                    ? "bg-primary/80 text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white border-gray-100 hover:bg-gray-50"
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
                  "flex-1 h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "velas"
                    ? "bg-primary/80 text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white border-gray-100 hover:bg-gray-50"
                )}
              >
                <CandlestickChart className="w-4 h-4" />
                VELAS
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 min-h-0">
            {view === "linea" ? (
              <LineChart
                series={series}
                isUp={isUp}
                currentPrice={price}
              />
            ) : (
              <CandlesChart
                series={series}
                isUp={isUp}
                currentPrice={price}
              />
            )}
          </div>
        </Card>

        <div className="flex gap-3 pt-2 pb-2 shrink-0">
          <Button
            onClick={() =>
              router.push(
                `/exchange/${encodeURIComponent(symbol)}/sell`
              )
            }
            className="flex-1 h-14 text-[12px] font-black tracking-widest uppercase rounded-[20px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none"
          >
            VENDER
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/exchange/${encodeURIComponent(symbol)}/buy`
              )
            }
            className="flex-1 h-14 rounded-[20px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[12px] border-none"
          >
            COMPRAR
          </Button>
        </div>
      </main>
    </div>
  );
}
