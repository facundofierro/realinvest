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
}: {
  series: number[];
  isUp: boolean;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const w = 320;
  const h = 200;
  const pad = 0;

  const d = series
    .map((v, i) => {
      const x =
        (i /
          Math.max(
            1,
            series.length - 1
          )) *
          (w - pad * 2) +
        pad;
      const y =
        h -
        pad -
        ((v - min) /
          Math.max(1e-6, max - min)) *
          (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

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

      <path
        d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
        fill="url(#areaFill)"
      />
      <path
        d={d}
        fill="none"
        stroke="url(#lineStroke)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CandlesChart({
  series,
  isUp,
}: {
  series: number[];
  isUp: boolean;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const w = 320;
  const h = 200;
  const pad = 0;
  const candles = series
    .slice(1)
    .map((v, i) => {
      const prev = series[i];
      const open = prev;
      const close = v;
      const high =
        Math.max(open, close) +
        Math.abs(close - open) * 0.6;
      const low =
        Math.min(open, close) -
        Math.abs(close - open) * 0.6;
      const x =
        ((i + 1) /
          Math.max(
            1,
            series.length - 1
          )) *
          (w - pad * 2) +
        pad;
      const scaleY = (val: number) =>
        h -
        pad -
        ((val - min) /
          Math.max(1e-6, max - min)) *
          (h - pad * 2);
      const yOpen = scaleY(open);
      const yClose = scaleY(close);
      const yHigh = scaleY(high);
      const yLow = scaleY(low);
      const up = close >= open;
      const color = up
        ? "#10b981"
        : "#ec4899";
      return {
        x,
        yOpen,
        yClose,
        yHigh,
        yLow,
        up,
        color,
      };
    });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full"
    >
      <defs>
        <linearGradient
          id="candleGlow"
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
            stopOpacity="0.35"
          />
          <stop
            offset="100%"
            stopColor="#8b5cf6"
            stopOpacity="0.15"
          />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        fill="url(#candleGlow)"
        opacity="0.15"
      />
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
          4,
          bodyBottom - bodyTop
        );
        const bodyW = 6;
        return (
          <g key={idx}>
            <line
              x1={c.x}
              x2={c.x}
              y1={c.yHigh}
              y2={c.yLow}
              stroke={c.color}
              strokeWidth="2"
              opacity="0.9"
            />
            <rect
              x={c.x - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={c.color}
              opacity={0.95}
              rx="2"
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
    <div className="flex flex-col pb-24 min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white px-4 py-5 rounded-b-[40px] shadow-xl border-none overflow-hidden">
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
            <h1 className="text-2xl font-black tracking-tight leading-none text-white uppercase">
              {token.symbol}
            </h1>
            <p className="text-xs italic font-medium text-white/70">
              Mercado de Tokens
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card className="overflow-hidden border border-primary/10 bg-primary/5">
          <div className="flex gap-4 justify-between items-start p-4">
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                Precio
              </div>
              <div className="text-3xl font-black tracking-tighter text-foreground">
                ${price.toFixed(2)}
              </div>
              <div className="text-[11px] font-bold text-muted-foreground">
                {token.projectTitle}
              </div>
            </div>
            <div
              className={cn(
                "px-4 py-3 text-right border transition-all rounded-[24px]",
                isUp
                  ? "shadow-lg bg-brand-green border-brand-green shadow-brand-green/20"
                  : "shadow-lg bg-brand-pink border-brand-pink shadow-brand-pink/20"
              )}
            >
              <div className="flex gap-2 justify-end items-center">
                {isUp ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-white" />
                )}
                <span className="text-lg font-black text-white">
                  {formatPct(changePct)}
                </span>
              </div>
              <div className="text-[10px] text-white/90 font-black uppercase tracking-widest mt-0.5">
                {timeframe === "all"
                  ? "All time"
                  : timeframe.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 px-4 pb-4">
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
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() =>
                    setTimeframe(tf)
                  }
                  className={cn(
                    "h-12 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                    timeframe === tf
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.05] z-10"
                      : "bg-background/70 border-border hover:bg-muted/40"
                  )}
                >
                  <span className="block leading-none">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "block text-[9px] mt-0.5",
                      timeframe === tf
                        ? "text-primary-foreground/90"
                        : up
                          ? "text-brand-green"
                          : "text-brand-pink"
                    )}
                  >
                    {formatPct(v)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden border backdrop-blur border-border/60 bg-card/80">
          <div className="flex justify-between items-center p-4">
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() =>
                  setView("linea")
                }
                className={cn(
                  "flex-1 h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "linea"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted/40"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                Línea
              </button>
              <button
                type="button"
                onClick={() =>
                  setView("velas")
                }
                className={cn(
                  "flex-1 h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  view === "velas"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted/40"
                )}
              >
                <CandlestickChart className="w-4 h-4" />
                Velas
              </button>
            </div>
          </div>
          <div className="pt-2 h-[400px]">
            {view === "linea" ? (
              <LineChart
                series={series}
                isUp={isUp}
              />
            ) : (
              <CandlesChart
                series={series}
                isUp={isUp}
              />
            )}
          </div>
        </Card>
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() =>
              router.push(
                `/exchange/${encodeURIComponent(symbol)}/sell`
              )
            }
            variant="outline"
            className="flex-1 h-16 text-[10px] font-black tracking-widest uppercase rounded-2xl border-border bg-card/50 hover:bg-muted/50 hover:text-foreground transition-all active:scale-95"
          >
            VENDER
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/exchange/${encodeURIComponent(symbol)}/buy`
              )
            }
            className="flex-[1.5] h-16 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[11px]"
          >
            COMPRAR
          </Button>
        </div>
      </main>
    </div>
  );
}
