"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui/components/ui/tabs";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  MarketToken,
  Timeframe,
  ChartView,
} from "@/types/wallet";
import Image from "next/image";
import {
  Building2,
  Layers,
  BarChart3,
  CandlestickChart,
  List,
  MapPin,
  Maximize2,
  Info,
  Layout,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  useMarketOrderBook,
  useMarketSeries,
  useWalletBalances,
  useWalletHoldings,
  useWalletPositions,
} from "@/hooks/use-queries";
import {
  formatCurrency,
  formatPrice,
  formatTokenAmount,
} from "@/lib/format";
import {
  LineChart,
  CandlesChart,
  OrderBook,
} from "./exchange/charts";
import { TradeDialog } from "./exchange/trade-dialog";
import { MarketStats } from "./exchange/market-stats";
import { ViewSelector } from "./exchange/view-selector";

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

interface DesktopTokenTabsProps {
  token: MarketToken;
  onClose?: () => void;
}

export function DesktopTokenTabs({
  token,
}: DesktopTokenTabsProps) {
  const [activeTab, setActiveTab] =
    useState("invest");

  const [timeframe, setTimeframe] =
    useState<Timeframe>("24h");
  const [chartView, setChartView] =
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
  const [amount, setAmount] =
    useState("");
  const [
    limitPriceInput,
    setLimitPriceInput,
  ] = useState("");

  const isUp = token.change24hPct >= 0;

  const symbol = token.symbol;

  const { data: orderBook } =
    useMarketOrderBook(symbol);
  const { data: series } =
    useMarketSeries(
      symbol,
      timeframe,
      100
    );
  const { data: balances = [] } =
    useWalletBalances();
  const { data: holdings = [] } =
    useWalletHoldings();
  const { data: positions = [] } =
    useWalletPositions();

  const price = token.priceUsd;
  const change = getChangePct(
    token,
    timeframe
  );

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

  const userPositions = useMemo(
    () =>
      positions.filter(
        (p) => p.tokenSymbol === symbol
      ),
    [positions, symbol]
  );

  const openOrdersValue =
    useMemo(() => {
      const relevant =
        userPositions.filter(
          (p) =>
            p.status === "OPEN" ||
            p.status ===
              "PARTIALLY_FILLED"
        );
      return relevant.reduce(
        (acc, p) =>
          acc +
          (p.totalAmount -
            p.filledAmount) *
            p.orderPriceUsd,
        0
      );
    }, [userPositions]);

  const userHoldingValue =
    useMemo(() => {
      const holding = holdings.find(
        (h) => h.tokenSymbol === symbol
      );
      return holding
        ? holding.tokens * price
        : 0;
    }, [holdings, symbol, price]);

  const userBalance = useMemo(() => {
    return (
      balances.find(
        (b) => b.currencyCode === "USDT"
      )?.available ?? 0
    );
  }, [balances]);

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
        token.sellPriceUsd ??
        token.priceUsd
      );
    }, [
      orderBook,
      token.priceUsd,
      token.sellPriceUsd,
    ]);

  const displayBuyPrice =
    useMemo(() => {
      if (
        orderBook?.asks &&
        orderBook.asks.length > 0
      ) {
        return orderBook.asks[0]!.price;
      }
      return (
        token.buyPriceUsd ??
        token.priceUsd
      );
    }, [
      orderBook,
      token.buyPriceUsd,
      token.priceUsd,
    ]);

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

  return (
    <div
      className={cn(
        "flex overflow-hidden relative flex-col h-full rounded-3xl border shadow-xl transition-all duration-500",
        activeTab === "invest"
          ? "bg-linear-to-b from-gray-900 via-slate-900 to-black border-white/10"
          : "bg-background"
      )}
    >
      {/* Top Tabs Navigation */}
      <div
        className={cn(
          "p-4 border-b transition-colors duration-500",
          activeTab === "invest"
            ? "border-white/10 bg-transparent"
            : "bg-muted/5"
        )}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList
            className={cn(
              "grid grid-cols-3 p-1 mx-auto w-full max-w-md h-11 rounded-2xl border transition-all duration-500",
              activeTab === "invest"
                ? "bg-white/5 border-white/10"
                : "bg-muted/50 border-border/20"
            )}
          >
            <TabsTrigger
              value="invest"
              className={cn(
                "rounded-xl flex gap-2 items-center text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "invest"
                  ? "data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
                  : "data-[state=active]:bg-background data-[state=active]:shadow-sm"
              )}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Invertir
            </TabsTrigger>
            <TabsTrigger
              value="project"
              className={cn(
                "rounded-xl flex gap-2 items-center text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "invest"
                  ? "data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
                  : "data-[state=active]:bg-background data-[state=active]:shadow-sm"
              )}
            >
              <Info className="h-3.5 w-3.5" />
              Proyecto
            </TabsTrigger>
            <TabsTrigger
              value="unit"
              className={cn(
                "rounded-xl flex gap-2 items-center text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "invest"
                  ? "data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
                  : "data-[state=active]:bg-background data-[state=active]:shadow-sm"
              )}
            >
              <Layout className="h-3.5 w-3.5" />
              Unidad
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 p-6">
        <Tabs
          value={activeTab}
          className="h-full"
        >
          <TabsContent
            value="project"
            className="mt-0 space-y-8 duration-300 animate-in fade-in slide-in-from-right-4"
          >
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
                Sobre el Desarrollo
              </h3>
              <p className="text-base font-medium leading-relaxed text-foreground/80">
                Este desarrollo de
                vanguardia redefine el
                lujo urbano en Nuñez.
                Con terminaciones de
                primer nivel, amenities
                premium y una ubicación
                estratégica frente al
                corredor norte,
                representa una
                oportunidad excepcional
                de inversión con alta
                apreciación proyectada.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/10">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                  ROI Estimado
                </h4>
                <div className="text-2xl font-black text-primary">
                  {token.roiPct?.toFixed(
                    1
                  ) || "12.5"}
                  %
                </div>
                <p className="text-[10px] text-primary/60 mt-1 uppercase font-bold">
                  Anual proyectado
                </p>
              </div>
              <div className="p-6 rounded-[28px] bg-muted/30 border border-border/40">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Marketcap
                </h4>
                <div className="text-2xl font-black text-[#3B2146]">
                  $
                  {(
                    token.marketCapUsd /
                    1000
                  ).toFixed(0)}
                  K
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold">
                  Valuación total
                </p>
              </div>
            </div>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
                Ubicación
              </h3>
              <div className="overflow-hidden relative w-full h-48 rounded-3xl border bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=1000&auto=format&fit=crop"
                  fill
                  className="object-cover opacity-80"
                  alt="Map"
                />
                <div className="absolute inset-0 bg-primary/10" />
                <div className="flex absolute right-6 bottom-6 left-6 gap-3 items-center p-4 rounded-2xl border shadow-lg backdrop-blur bg-background/90">
                  <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase">
                      Libertador 8000,
                      Nuñez
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                      Buenos Aires,
                      Argentina
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent
            value="unit"
            className="mt-0 space-y-8 duration-300 animate-in fade-in slide-in-from-right-4"
          >
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
                Detalles de la Unidad
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    icon: Building2,
                    label: "Piso",
                    value: "12",
                  },
                  {
                    icon: Layers,
                    label: "Tipo",
                    value:
                      "3 Ambientes",
                  },
                  {
                    icon: Maximize2,
                    label: "Superficie",
                    value: "75 M²",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 text-center rounded-2xl border bg-muted/20 border-border/40"
                  >
                    <item.icon className="mx-auto mb-2 w-5 h-5 text-primary" />
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-black text-[#3B2146]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">
                Plano Arquitectónico
              </h3>
              <div className="flex relative justify-center items-center p-8 w-full bg-white rounded-3xl border shadow-inner aspect-video">
                <Image
                  src="/building_floor_layout.png"
                  fill
                  className="object-contain p-8"
                  alt="Floor Plan"
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent
            value="invest"
            className="flex flex-col p-4 -mx-6 mt-0 -mb-6 space-y-3 h-full duration-300 animate-in fade-in slide-in-from-right-4"
          >
            <MarketStats
              userHolding={
                userHoldingValue
              }
              userBalance={userBalance}
              openOrders={
                openOrdersValue
              }
              timeframe={timeframe}
              onTimeframeChange={
                setTimeframe
              }
              token={token}
              getChangePct={
                getChangePct
              }
              formatPct={formatPct}
            />

            {/* Chart View Section */}
            <div className="flex flex-col flex-1 min-h-[320px] -mx-4 w-[calc(100%+2rem)] text-white shadow-inner bg-white/5">
              <div className="flex justify-between items-center p-4 shrink-0">
                <ViewSelector
                  view={chartView}
                  onViewChange={
                    setChartView
                  }
                />
              </div>
              <div className="flex-1 p-3 min-h-0 sm:p-4">
                {chartView ===
                  "linea" && (
                  <LineChart
                    series={
                      computedSeries
                    }
                    isUp={isUp}
                    currentPrice={price}
                  />
                )}
                {chartView ===
                  "velas" && (
                  <CandlesChart
                    series={
                      computedSeries
                    }
                    isUp={isUp}
                    currentPrice={price}
                  />
                )}
                {chartView ===
                  "ordenes" &&
                  orderBook && (
                    <OrderBook
                      orderBook={
                        orderBook
                      }
                    />
                  )}
              </div>
            </div>

            {/* Buy/Sell Buttons */}
            <div className="flex gap-3 pt-3 pb-2 sm:pt-4 sm:pb-6 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setTradeType("SELL");
                  setOrderType(
                    "MARKET"
                  );
                  setIsTradeDialogOpen(
                    true
                  );
                }}
                className="flex-1 h-16 sm:h-20 flex-col gap-0.5 text-[11px] sm:text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-pink bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
              >
                <span>VENDER</span>
                <span className="text-2xl font-bold tracking-normal normal-case opacity-100 sm:text-3xl">
                  {formatPrice(
                    displaySellPrice
                  )}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTradeType("BUY");
                  setOrderType(
                    "MARKET"
                  );
                  setIsTradeDialogOpen(
                    true
                  );
                }}
                className="flex-1 h-16 sm:h-20 flex-col gap-0.5 text-[11px] sm:text-[12px] font-black tracking-widest uppercase rounded-[24px] border-brand-green bg-gray-100 text-[#3B2146] shadow-sm hover:bg-gray-200 hover:text-[#3B2146] active:scale-95 transition-all"
              >
                <span>COMPRAR</span>
                <span className="text-2xl font-bold tracking-normal normal-case opacity-100 sm:text-3xl">
                  {formatPrice(
                    displayBuyPrice
                  )}
                </span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
        userTokens={
          userHoldingValue / price
        }
        marketTradePrice={
          tradeType === "BUY"
            ? displayBuyPrice
            : displaySellPrice
        }
        marketSimulation={
          marketSimulation
        }
        onMax={() => {
          if (tradeType === "SELL") {
            setAmount(
              (
                userHoldingValue / price
              ).toFixed(4)
            );
          } else {
            const p =
              tradeType === "BUY"
                ? displayBuyPrice
                : displaySellPrice;
            setAmount(
              (userBalance / p).toFixed(
                4
              )
            );
          }
        }}
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
