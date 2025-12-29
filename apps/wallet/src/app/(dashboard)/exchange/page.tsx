"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Star,
  LayoutGrid,
  CircleDollarSign,
  Filter,
  Layers,
  MapPin,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tabs,
  TabsContent,
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
import type {
  MarketToken,
  Project,
  Position,
  Transaction,
} from "@/types/wallet";

type SortBy = "marketCap" | "change";
type Timeframe =
  | "24h"
  | "7d"
  | "30d"
  | "all";

function formatUsd(
  value: number
): string {
  return value.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
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

function getUnitLabelFromSymbol(
  symbol: string
): string {
  const parts = symbol.split("-");
  const last = parts.at(-1);
  return last && last.length <= 6
    ? last
    : symbol.slice(0, 6).toUpperCase();
}

function isActivePosition(
  position: Position
): boolean {
  return (
    position.status === "OPEN" ||
    position.status ===
      "PARTIALLY_FILLED"
  );
}

function ExchangePageInner() {
  const router = useRouter();
  const searchParams =
    useSearchParams();
  const projectFilter =
    searchParams.get("project");
  const tabParam =
    searchParams.get("tab");

  const [activeTab, setActiveTab] =
    useState(tabParam || "market");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [tokens, setTokens] = useState<
    MarketToken[]
  >([]);
  const [projects, setProjects] =
    useState<Project[]>([]);
  const [positions, setPositions] =
    useState<Position[]>([]);
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);
  const [sortBy, setSortBy] =
    useState<SortBy>("marketCap");
  const [timeframe, setTimeframe] =
    useState<Timeframe>("all");
  const [
    selectedTokenId,
    setSelectedTokenId,
  ] = useState<string | null>(null);
  const [
    selectedPositionId,
    setSelectedPositionId,
  ] = useState<string | null>(null);
  const [
    isOrderDetailsOpen,
    setIsOrderDetailsOpen,
  ] = useState(false);
  const [
    isClosingOrder,
    setIsClosingOrder,
  ] = useState(false);
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
          projectsRes,
          positionsRes,
          transactionsRes,
        ] = await Promise.all([
          fetch("/api/market/tokens", {
            signal: controller.signal,
          }),
          fetch("/api/projects", {
            signal: controller.signal,
          }),
          fetch(
            "/api/wallet/positions",
            {
              signal: controller.signal,
            }
          ),
          fetch("/api/transactions", {
            signal: controller.signal,
          }),
        ]);

        if (!tokensRes.ok)
          throw new Error(
            "Failed to load tokens"
          );
        if (!projectsRes.ok)
          throw new Error(
            "Failed to load projects"
          );
        if (!positionsRes.ok)
          throw new Error(
            "Failed to load positions"
          );
        if (!transactionsRes.ok)
          throw new Error(
            "Failed to load transactions"
          );

        const tokensJson =
          (await tokensRes.json()) as {
            tokens: MarketToken[];
          };
        const projectsJson =
          (await projectsRes.json()) as {
            projects: Project[];
          };
        const positionsJson =
          (await positionsRes.json()) as {
            positions: Position[];
          };
        const transactionsJson =
          (await transactionsRes.json()) as {
            transactions: Transaction[];
          };

        setTokens(
          tokensJson.tokens ?? []
        );
        setProjects(
          projectsJson.projects ?? []
        );
        setPositions(
          positionsJson.positions ?? []
        );
        setTransactions(
          transactionsJson.transactions ??
            []
        );
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
  }, []);

  const tokenBySymbol = useMemo(
    () =>
      new Map(
        tokens.map((t) => [t.symbol, t])
      ),
    [tokens]
  );

  const projectById = useMemo(
    () =>
      new Map(
        projects.map((p) => [p.id, p])
      ),
    [projects]
  );

  const selectedToken = useMemo(
    () =>
      tokens.find(
        (t) => t.id === selectedTokenId
      ) ?? null,
    [tokens, selectedTokenId]
  );

  const selectedPosition = useMemo(
    () =>
      positions.find(
        (p) =>
          p.id === selectedPositionId
      ) ?? null,
    [positions, selectedPositionId]
  );

  const filteredTokens = useMemo(() => {
    let list = [...tokens];

    if (projectFilter) {
      list = list.filter(
        (t) =>
          t.projectId === projectFilter
      );
    }

    list.sort((a, b) => {
      if (sortBy === "marketCap")
        return (
          b.marketCapUsd -
          a.marketCapUsd
        );
      return (
        getChangePct(b, timeframe) -
        getChangePct(a, timeframe)
      );
    });
    return list;
  }, [
    tokens,
    sortBy,
    timeframe,
    projectFilter,
  ]);

  const favorites = useMemo(
    () =>
      tokens.filter(
        (t) => t.isFavorite
      ),
    [tokens]
  );

  const activePositions = useMemo(
    () =>
      positions.filter(
        isActivePosition
      ),
    [positions]
  );

  const summary = useMemo(() => {
    const rows = activePositions.filter(
      (p) => p.filledAmount > 0
    );
    const totalValueUsd = rows.reduce(
      (acc, p) =>
        acc +
        p.filledAmount *
          p.marketPriceUsd,
      0
    );
    const totalCostUsd = rows.reduce(
      (acc, p) => {
        const opened =
          p.openedMarketPriceUsd ??
          p.orderPriceUsd;
        return (
          acc + p.filledAmount * opened
        );
      },
      0
    );
    const totalGainUsd = rows.reduce(
      (acc, p) => {
        const opened =
          p.openedMarketPriceUsd ??
          p.orderPriceUsd;
        const raw =
          p.marketPriceUsd - opened;
        const gain =
          (p.side === "SELL"
            ? -raw
            : raw) * p.filledAmount;
        return acc + gain;
      },
      0
    );
    const gainPct =
      totalCostUsd > 0
        ? (totalGainUsd /
            totalCostUsd) *
          100
        : 0;
    return {
      totalValueUsd,
      totalGainUsd,
      gainPct,
    };
  }, [activePositions]);

  const selectedPositionTransactions =
    useMemo(() => {
      if (!selectedPositionId)
        return [];
      return transactions.filter(
        (t) => {
          const meta = t.metadata as
            | Record<string, unknown>
            | undefined;
          return (
            meta?.positionId ===
            selectedPositionId
          );
        }
      );
    }, [
      transactions,
      selectedPositionId,
    ]);

  async function closeSelectedOrder() {
    if (!selectedPosition) return;
    if (
      !isActivePosition(
        selectedPosition
      )
    )
      return;
    if (isClosingOrder) return;

    try {
      setIsClosingOrder(true);
      const res = await fetch(
        "/api/wallet/positions",
        {
          method: "POST",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            positionId:
              selectedPosition.id,
          }),
        }
      );
      if (!res.ok)
        throw new Error(
          "Failed to close order"
        );

      setPositions((prev) =>
        prev.map((p) =>
          p.id === selectedPosition.id
            ? {
                ...p,
                status: "CANCELLED",
              }
            : p
        )
      );
      setSelectedPositionId(null);
      setIsOrderDetailsOpen(false);
    } finally {
      setIsClosingOrder(false);
    }
  }

  const TokenRow = ({
    token,
  }: {
    token: MarketToken;
  }) => {
    const unitLabel =
      token.unitId ??
      getUnitLabelFromSymbol(
        token.symbol
      );
    const change = getChangePct(
      token,
      timeframe
    );
    const isUp = change >= 0;

    return (
      <div
        key={token.id}
        onClick={() => {
          setSelectedTokenId(token.id);
          setSelectedPositionId(null);
        }}
        className={cn(
          "flex flex-col p-4 rounded-[28px] transition-all cursor-pointer border",
          selectedTokenId === token.id
            ? "bg-white border-primary shadow-xl scale-[1.02] z-10 relative"
            : "bg-card border-border/40 hover:border-primary/30 shadow-sm"
        )}
      >
        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-4 items-center min-w-0">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-colors shrink-0",
                selectedTokenId ===
                  token.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-muted/30 text-[#3B2146] border border-border/50"
              )}
            >
              {unitLabel}
            </div>
            <div className="min-w-0">
              <div className="font-black text-[14px] uppercase text-[#3B2146] leading-tight truncate">
                {token.symbol}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5 truncate">
                {token.projectTitle}
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center shrink-0">
            {(token.buyPriceUsd ||
              token.sellPriceUsd) && (
              <div className="flex flex-col gap-1 items-end">
                {typeof token.sellPriceUsd ===
                  "number" && (
                  <Badge
                    variant="outline"
                    className="bg-brand-pink/10 text-brand-pink border-brand-pink/20 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border h-auto"
                  >
                    $
                    {token.sellPriceUsd.toFixed(
                      2
                    )}
                  </Badge>
                )}
                {typeof token.buyPriceUsd ===
                  "number" && (
                  <Badge
                    variant="outline"
                    className="bg-brand-green/10 text-brand-green border-brand-green/20 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border h-auto"
                  >
                    $
                    {token.buyPriceUsd.toFixed(
                      2
                    )}
                  </Badge>
                )}
              </div>
            )}

            <div className="text-right">
              <div className="text-[16px] font-black text-[#3B2146] leading-tight">
                $
                {token.priceUsd.toFixed(
                  2
                )}
              </div>
              <div
                className={cn(
                  "text-[10px] font-black uppercase mt-0.5 flex items-center justify-end",
                  isUp
                    ? "text-brand-green"
                    : "text-brand-pink"
                )}
              >
                {isUp ? "+" : ""}
                {change.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] -mb-24 bg-background overflow-hidden">
      <header className="sticky top-0 z-50 bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white px-4 py-5 rounded-b-[40px] shadow-xl border-none overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10"></div>

        <div className="flex relative z-10 gap-4 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.history.back()
            }
            className="text-white rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1 pr-10 text-center">
            <h1 className="text-3xl font-black tracking-tight leading-none text-white uppercase">
              Exchange
            </h1>
            <p className="mt-1 font-serif text-sm italic font-medium text-white/70">
              Mercado de Tokens
            </p>
          </div>
        </div>
      </header>

      <div className="flex overflow-hidden flex-col flex-1">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex overflow-hidden flex-col flex-1 w-full"
        >
          <div className="z-10 px-4 pt-2 pb-2 border-b backdrop-blur border-border/50 bg-background/95">
            <TabsList className="flex gap-4 justify-between items-center p-0 w-full h-auto bg-transparent border-none">
              <TabsTrigger
                value="market"
                className="flex-1 min-w-0 h-10 px-0 rounded-none bg-transparent border-b-2 border-transparent text-[11px] font-black uppercase tracking-wider text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-primary hover:text-foreground transition-colors"
              >
                Mercado
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex-1 min-w-0 h-10 px-0 rounded-none bg-transparent border-b-2 border-transparent text-[11px] font-black uppercase tracking-wider text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-primary hover:text-foreground transition-colors"
              >
                Favoritos
              </TabsTrigger>
              <TabsTrigger
                value="positions"
                className="flex-1 min-w-0 h-10 px-0 rounded-none bg-transparent border-b-2 border-transparent text-[11px] font-black uppercase tracking-wider text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-primary hover:text-foreground transition-colors"
              >
                Mis Posiciones
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="market"
            className="flex flex-col flex-1 overflow-hidden data-[state=active]:flex"
          >
            <div className="z-10 p-4 pb-2 space-y-4 shrink-0 bg-background">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 w-full">
                  <Button
                    variant={
                      sortBy ===
                      "marketCap"
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "rounded-2xl gap-1 flex-1 h-11 transition-all text-[10px] uppercase font-black tracking-wider border-2",
                      sortBy ===
                        "marketCap"
                        ? "shadow-md bg-primary/80 text-primary-foreground border-primary"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    )}
                    onClick={() =>
                      setSortBy(
                        "marketCap"
                      )
                    }
                  >
                    <CircleDollarSign className="h-3.5 w-3.5" />
                    <span className="truncate">
                      Marketcap
                    </span>
                  </Button>
                  <Button
                    variant={
                      sortBy ===
                      "change"
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "rounded-2xl gap-1 flex-1 h-11 transition-all text-[10px] uppercase font-black tracking-wider border-2",
                      sortBy ===
                        "change"
                        ? "shadow-md bg-primary/80 text-primary-foreground border-primary"
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    )}
                    onClick={() =>
                      setSortBy(
                        "change"
                      )
                    }
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="truncate">
                      % Var.
                    </span>
                  </Button>

                  <div className="flex gap-1 items-center p-1 h-11 rounded-2xl border bg-primary/5 border-primary/10">
                    {(
                      [
                        "24H",
                        "7D",
                        "30D",
                        "ALL",
                      ] as const
                    ).map((tf) => (
                      <Button
                        key={tf}
                        variant={
                          timeframe ===
                          tf.toLowerCase()
                            ? "secondary"
                            : "ghost"
                        }
                        size="sm"
                        className={cn(
                          "rounded-xl px-2 h-full text-[9px] font-black tracking-tighter transition-all border-2",
                          timeframe ===
                            tf.toLowerCase()
                            ? "shadow-sm bg-primary/80 text-primary-foreground border-primary"
                            : "bg-transparent text-primary/60 border-transparent hover:bg-primary/10"
                        )}
                        onClick={() =>
                          setTimeframe(
                            tf.toLowerCase() as
                              | "24h"
                              | "7d"
                              | "30d"
                              | "all"
                          )
                        }
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 pb-32">
              <div className="grid gap-4">
                {filteredTokens.length >
                0 ? (
                  filteredTokens.map(
                    (token) => (
                      <TokenRow
                        key={token.id}
                        token={token}
                      />
                    )
                  )
                ) : (
                  <div className="py-20 text-center rounded-3xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                    <Search className="mx-auto mb-3 w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium">
                      No se encontraron
                      tokens
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="favorites"
            className="flex-1 overflow-y-auto p-4 pb-32 space-y-4 data-[state=active]:block"
          >
            <div className="grid gap-4">
              {favorites.length > 0 ? (
                favorites.map(
                  (token) => (
                    <TokenRow
                      key={token.id}
                      token={token}
                    />
                  )
                )
              ) : (
                <div className="py-20 text-center rounded-3xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                  <Star className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">
                    No tienes favoritos
                    aún
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="positions"
            className="flex-1 overflow-y-auto p-4 pb-32 space-y-4 data-[state=active]:block"
          >
            {loadError && (
              <div className="p-4 rounded-[28px] border border-dashed text-muted-foreground bg-muted/5 border-muted/20 text-sm">
                {loadError}
              </div>
            )}

            <Card className="bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-primary/10 overflow-hidden relative shadow-lg rounded-[28px] mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Posiciones Activas
                </CardTitle>
                <div className="text-3xl font-black tracking-tighter text-foreground">
                  $
                  {formatUsd(
                    summary.totalValueUsd
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-[10px] font-black flex items-center w-fit px-2.5 py-1 rounded-full border",
                    summary.totalGainUsd >=
                      0
                      ? "text-brand-green bg-brand-green/10 border-brand-green/20"
                      : "text-brand-pink bg-brand-pink/10 border-brand-pink/20"
                  )}
                >
                  <TrendingUp className="mr-1 w-3 h-3" />
                  {summary.totalGainUsd >=
                  0
                    ? "+"
                    : "-"}
                  $
                  {formatUsd(
                    Math.abs(
                      summary.totalGainUsd
                    )
                  )}{" "}
                  (
                  {Math.abs(
                    summary.gainPct
                  ).toFixed(1)}
                  %)
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {activePositions.length >
              0 ? (
                [...activePositions]
                  .sort((a, b) => {
                    const openedA =
                      a.openedMarketPriceUsd ??
                      a.orderPriceUsd;
                    const openedB =
                      b.openedMarketPriceUsd ??
                      b.orderPriceUsd;
                    const gainA =
                      (a.side === "SELL"
                        ? -1
                        : 1) *
                      (a.marketPriceUsd -
                        openedA) *
                      a.filledAmount;
                    const gainB =
                      (b.side === "SELL"
                        ? -1
                        : 1) *
                      (b.marketPriceUsd -
                        openedB) *
                      b.filledAmount;
                    return (
                      Math.abs(gainB) -
                      Math.abs(gainA)
                    );
                  })
                  .map((pos) => {
                    const token =
                      tokenBySymbol.get(
                        pos.tokenSymbol
                      );
                    const unitLabel =
                      getUnitLabelFromSymbol(
                        pos.tokenSymbol
                      );
                    const openedPrice =
                      pos.openedMarketPriceUsd ??
                      pos.orderPriceUsd;
                    const raw =
                      pos.marketPriceUsd -
                      openedPrice;
                    const gainUsd =
                      (pos.side ===
                      "SELL"
                        ? -raw
                        : raw) *
                      pos.filledAmount;
                    const marketValueUsd =
                      pos.filledAmount *
                      pos.marketPriceUsd;
                    const progress =
                      pos.totalAmount >
                      0
                        ? (pos.filledAmount /
                            pos.totalAmount) *
                          100
                        : 0;
                    const isSelected =
                      selectedPositionId ===
                      pos.id;

                    return (
                      <div
                        key={pos.id}
                        onClick={() => {
                          setSelectedPositionId(
                            pos.id
                          );
                          setSelectedTokenId(
                            null
                          );
                        }}
                        className={cn(
                          "flex flex-col p-4 rounded-[28px] transition-all cursor-pointer border",
                          isSelected
                            ? "bg-white border-primary shadow-xl scale-[1.02] z-10 relative"
                            : "bg-card border-border/40 hover:border-primary/30 shadow-sm"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex gap-4 items-center min-w-0">
                            <div
                              className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors shrink-0",
                                isSelected
                                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                                  : "bg-muted/30 text-[#3B2146] border border-border/50"
                              )}
                            >
                              {
                                unitLabel
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight truncate">
                                {
                                  pos.tokenSymbol
                                }
                              </div>
                              <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5 truncate">
                                {token?.projectTitle ??
                                  "Proyecto"}
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                  {
                                    pos.filledAmount
                                  }{" "}
                                  /{" "}
                                  {
                                    pos.totalAmount
                                  }{" "}
                                  TOKENS
                                </span>
                                <Badge className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-none rounded-full font-black">
                                  {Math.round(
                                    progress
                                  )}
                                  %
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                              Valor
                              Actual
                            </div>
                            <div className="text-[17px] font-black text-[#3B2146] leading-tight">
                              $
                              {formatUsd(
                                marketValueUsd
                              )}
                            </div>
                            <div
                              className={cn(
                                "text-[10px] font-black uppercase mt-1",
                                gainUsd >=
                                  0
                                  ? "text-brand-green"
                                  : "text-brand-pink"
                              )}
                            >
                              {gainUsd >=
                              0
                                ? "+"
                                : "-"}
                              $
                              {formatUsd(
                                Math.abs(
                                  gainUsd
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="p-3 rounded-2xl border backdrop-blur-sm bg-background/40 border-border/50">
                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 opacity-60">
                              Tu Orden
                            </div>
                            <div className="text-sm font-black">
                              $
                              {pos.orderPriceUsd.toFixed(
                                2
                              )}
                            </div>
                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-1 opacity-60">
                              Apertura $
                              {openedPrice.toFixed(
                                2
                              )}
                            </div>
                          </div>
                          <div className="p-3 rounded-2xl border backdrop-blur-sm bg-background/40 border-border/50">
                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 opacity-60">
                              Mercado
                            </div>
                            <div className="text-sm font-black">
                              $
                              {pos.marketPriceUsd.toFixed(
                                2
                              )}
                            </div>
                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-1 opacity-60">
                              Lado{" "}
                              {pos.side}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                Ganancia
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-black",
                                  gainUsd >=
                                    0
                                    ? "text-brand-green"
                                    : "text-brand-pink"
                                )}
                              >
                                {gainUsd >=
                                0
                                  ? "+"
                                  : "-"}
                                $
                                {formatUsd(
                                  Math.abs(
                                    gainUsd
                                  )
                                )}
                              </span>
                            </div>
                            <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                              Progresión
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-1000 bg-primary"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="py-20 text-center rounded-3xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                  <Layers className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">
                    No tenés posiciones
                    activas
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedPosition && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border border-primary/20 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.3)] rounded-[32px] p-6 overflow-hidden relative">
            <button
              onClick={() => {
                setSelectedPositionId(
                  null
                );
                setIsOrderDetailsOpen(
                  false
                );
              }}
              className="flex absolute top-6 right-6 z-20 justify-center items-center w-8 h-8 rounded-full shadow-md transition-colors bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full blur-3xl bg-primary/5" />

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1 min-w-0">
                  <div className="flex gap-2 items-center min-w-0">
                    <h3 className="text-xl font-black tracking-tight truncate">
                      {
                        selectedPosition.tokenSymbol
                      }
                    </h3>
                    <Badge
                      className={cn(
                        "font-bold tracking-widest uppercase border-0 text-[10px]",
                        isActivePosition(
                          selectedPosition
                        )
                          ? "bg-brand-green/20 text-brand-green"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {
                        selectedPosition.status
                      }
                    </Badge>
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase truncate text-muted-foreground">
                    {tokenBySymbol.get(
                      selectedPosition.tokenSymbol
                    )?.projectTitle ??
                      "Proyecto"}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>
                      Lado{" "}
                      {
                        selectedPosition.side
                      }
                    </span>
                    <span>
                      {
                        selectedPosition.filledAmount
                      }
                      /
                      {
                        selectedPosition.totalAmount
                      }{" "}
                      tokens
                    </span>
                  </div>
                </div>
                <div className="pr-10 text-right">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                    Valor Actual
                  </div>
                  <div className="text-xl font-black text-foreground">
                    $
                    {formatUsd(
                      selectedPosition.filledAmount *
                        selectedPosition.marketPriceUsd
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setIsOrderDetailsOpen(
                      true
                    )
                  }
                  className="flex-1 h-14 text-xs font-black tracking-widest uppercase rounded-2xl border-border/50 hover:bg-muted hover:text-foreground"
                >
                  Ver Detalles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedPosition.tokenSymbol
                      );
                    router.push(
                      `/exchange/${symbol}`
                    );
                  }}
                  className="flex-1 h-14 text-xs font-black tracking-widest uppercase rounded-2xl border-border/50 hover:bg-muted hover:text-foreground"
                >
                  Ver Token
                </Button>
                <Button
                  disabled={
                    !isActivePosition(
                      selectedPosition
                    ) || isClosingOrder
                  }
                  onClick={
                    closeSelectedOrder
                  }
                  className="flex-[1.5] h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 font-black uppercase tracking-widest text-xs disabled:opacity-40 disabled:shadow-none"
                >
                  Cerrar Orden
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={isOrderDetailsOpen}
        onOpenChange={
          setIsOrderDetailsOpen
        }
      >
        <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">
                Detalles de la orden
              </DialogTitle>
            </DialogHeader>

            {selectedPosition ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-border/50 bg-muted/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Orden
                  </div>
                  <div className="mt-1 text-sm font-black">
                    {
                      selectedPosition.tokenSymbol
                    }
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="p-3 rounded-xl border border-border/50 bg-background/40">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                        Apertura
                      </div>
                      <div className="mt-1 text-sm font-black">
                        $
                        {(
                          selectedPosition.openedMarketPriceUsd ??
                          selectedPosition.orderPriceUsd
                        ).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-border/50 bg-background/40">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                        Orden
                      </div>
                      <div className="mt-1 text-sm font-black">
                        $
                        {selectedPosition.orderPriceUsd.toFixed(
                          2
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-border/50 bg-background/40">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                        Mercado
                      </div>
                      <div className="mt-1 text-sm font-black">
                        $
                        {selectedPosition.marketPriceUsd.toFixed(
                          2
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Transacciones
                      completadas
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none rounded-full font-black text-[10px]">
                      {
                        selectedPositionTransactions.filter(
                          (t) =>
                            t.status ===
                            "COMPLETED"
                        ).length
                      }
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {selectedPositionTransactions.filter(
                      (t) =>
                        t.status ===
                        "COMPLETED"
                    ).length > 0 ? (
                      selectedPositionTransactions
                        .filter(
                          (t) =>
                            t.status ===
                            "COMPLETED"
                        )
                        .sort(
                          (a, b) =>
                            new Date(
                              b.createdAt
                            ).getTime() -
                            new Date(
                              a.createdAt
                            ).getTime()
                        )
                        .map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between items-center p-4 rounded-2xl border border-border/50 bg-background/40"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-black truncate">
                                {t.description ??
                                  t.type}
                              </div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                {new Date(
                                  t.createdAt
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-black">
                                {
                                  t
                                    .amount
                                    .currencyCode
                                }{" "}
                                {formatUsd(
                                  t
                                    .amount
                                    .amount
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="py-10 text-sm text-center rounded-2xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                        No hay
                        transacciones
                        completadas para
                        esta orden
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-sm text-center rounded-2xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                Seleccioná una orden
                para ver detalles
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full h-12 text-xs font-bold tracking-widest uppercase rounded-xl"
              onClick={() =>
                setIsOrderDetailsOpen(
                  false
                )
              }
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                {selectedToken?.symbol}
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
                    actual del mercado.
                    La orden se
                    ejecutará
                    inmediatamente al
                    mejor precio
                    disponible.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Establece un precio
                    específico para
                    comprar o vender. La
                    orden se ejecutará
                    solo cuando el
                    mercado alcance tu
                    precio.
                  </p>
                )}

                <div className="space-y-4">
                  {orderType ===
                    "LIMIT" && (
                    <div className="space-y-2">
                      <Label>
                        Precio Objetivo
                        (
                        {
                          selectedToken?.symbol
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

      {selectedToken && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-300">
          <div className="bg-card/95 backdrop-blur-3xl border border-primary/30 shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.4)] rounded-[32px] p-6 overflow-hidden relative">
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                setSelectedTokenId(null)
              }
              className="absolute top-6 right-6 z-50 w-9 h-9 bg-white rounded-full border-none shadow-lg hover:bg-white/90 text-slate-500"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                      {
                        selectedToken.symbol
                      }
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-foreground">
                    {
                      selectedToken.projectTitle
                    }
                  </h3>
                  <div className="flex flex-col gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="flex gap-1.5 items-center">
                      <MapPin className="w-3.5 h-3.5" />{" "}
                      {projectById.get(
                        selectedToken.projectId
                      )?.location ??
                        "-"}
                    </span>
                    <span className="flex gap-1.5 items-center">
                      <Layers className="w-3.5 h-3.5" />{" "}
                      ROI Est:{" "}
                      {typeof selectedToken.roiPct ===
                      "number"
                        ? selectedToken.roiPct.toFixed(
                            1
                          )
                        : "0.0"}
                      %
                    </span>
                  </div>
                </div>
                <div className="mt-10 text-right">
                  <div className="text-2xl font-black text-foreground">
                    $
                    {selectedToken.priceUsd.toFixed(
                      2
                    )}
                  </div>
                  <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                    STOCK:{" "}
                    {selectedToken.tokensAvailable ??
                      0}{" "}
                    TOKENS
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-[10px] font-black tracking-widest uppercase rounded-xl border-border hover:bg-muted/50 hover:text-foreground"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.symbol
                      );
                    const returnTo =
                      encodeURIComponent(
                        `/exchange/${symbol}`
                      );
                    router.push(
                      `/project/${encodeURIComponent(
                        selectedToken.projectId
                      )}?returnTo=${returnTo}`
                    );
                  }}
                >
                  PROYECTO
                </Button>
                <Button
                  disabled={
                    !positions.some(
                      (p) =>
                        p.tokenSymbol ===
                          selectedToken.symbol &&
                        p.filledAmount >
                          0
                    )
                  }
                  className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:scale-100"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.symbol
                      );
                    router.push(
                      `/exchange/${symbol}`
                    );
                  }}
                >
                  VENDER
                </Button>
                <Button
                  className="flex-[1.5] h-14 rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px]"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.symbol
                      );
                    router.push(
                      `/exchange/${symbol}`
                    );
                  }}
                >
                  COMPRAR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExchangePage() {
  return (
    <Suspense fallback={null}>
      <ExchangePageInner />
    </Suspense>
  );
}
