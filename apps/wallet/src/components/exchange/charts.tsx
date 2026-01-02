"use client";

import { MarketOrderBook } from "@/types/wallet";

export function LineChart({
  series,
  isUp,
  currentPrice,
}: {
  series: number[];
  isUp: boolean;
  currentPrice: number;
}) {
  if (!series || series.length === 0)
    return (
      <div className="h-[200px] w-full" />
    );

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
      series[series.length - 1]!;
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

export function CandlesChart({
  series,
  isUp,
  currentPrice,
}: {
  series: number[];
  isUp: boolean;
  currentPrice: number;
}) {
  if (!series || series.length === 0)
    return (
      <div className="h-[200px] w-full" />
    );
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
    const fallback = series[0]!;
    const open = chunk[0] ?? fallback;
    const close =
      (chunk.length > 0
        ? chunk[chunk.length - 1]
        : series[series.length - 1]) ??
      fallback;
    const high =
      chunk.length > 0
        ? Math.max(...chunk)
        : fallback;
    const low =
      chunk.length > 0
        ? Math.min(...chunk)
        : fallback;
    return { open, close, high, low };
  });

  const getRealPrice = (
    val: number
  ) => {
    const lastVal =
      series[series.length - 1]!;
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

export function OrderBook({
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
        <div className="text-[9px] sm:text-[10px] font-black text-white/50 uppercase tracking-widest text-right">
          Precio (USDT)
        </div>
        {asksWithWidth.map((ask, i) => (
          <div
            key={i}
            className="flex relative justify-between items-center h-5 sm:h-6 text-[11px] sm:text-xs group"
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
        <div className="text-[9px] sm:text-[10px] font-black text-white/50 uppercase tracking-widest">
          Precio (USDT)
        </div>
        {bidsWithWidth.map((bid, i) => (
          <div
            key={i}
            className="flex relative justify-between items-center h-5 sm:h-6 text-[11px] sm:text-xs group"
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
