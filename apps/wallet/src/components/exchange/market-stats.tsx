"use client";

import { Card } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MarketToken } from "@/types/wallet";

interface MarketStatsProps {
  userHolding: number;
  userBalance: number;
  openOrders: number;
  timeframe: string;
  onTimeframeChange: (tf: any) => void;
  token: MarketToken;
  getChangePct: (
    token: MarketToken,
    timeframe: any
  ) => number;
  formatPct: (value: number) => string;
}

export function MarketStats({
  userHolding,
  userBalance,
  openOrders,
  timeframe,
  onTimeframeChange,
  token,
  getChangePct,
  formatPct,
}: MarketStatsProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white shrink-0 rounded-[32px]">
      <div className="flex gap-4 justify-between items-start p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-6 justify-around items-center w-full">
          <div className="space-y-0.5 text-center">
            <div className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              TENENCIA
            </div>
            <div className="text-[clamp(16px,5.2vw,20px)] sm:text-xl font-black tracking-tighter text-[#3B2146]">
              {formatCurrency(
                userHolding
              )}
            </div>
          </div>
          <div className="w-px h-7 sm:h-8 bg-gray-100" />
          <div className="space-y-0.5 text-center">
            <div className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              LIQUIDEZ
            </div>
            <div className="text-[clamp(16px,5.2vw,20px)] sm:text-xl font-black tracking-tighter text-[#3B2146]">
              {formatCurrency(
                userBalance
              )}
            </div>
          </div>
          <div className="w-px h-7 sm:h-8 bg-gray-100" />
          <div className="space-y-0.5 text-center">
            <div className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              ORDENES
            </div>
            <div className="text-[clamp(16px,5.2vw,20px)] sm:text-xl font-black tracking-tighter text-[#3B2146]">
              {formatCurrency(
                openOrders
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 pb-4 sm:pb-5">
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
                onTimeframeChange(tf)
              }
              className={cn(
                "h-11 sm:h-[52px] rounded-2xl border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center",
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
                  "mt-0.5 sm:mt-1 px-2 py-1 rounded-[10px] text-[9px] sm:text-[10px] font-black inline-block shadow-sm text-white border-none min-w-[44px] sm:min-w-[50px]",
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
  );
}
