"use client";

import { UnitDetailsDialog } from "../unit-details-dialog";
import {
  formatCurrency,
  formatPrice,
} from "@/lib/format";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { DesktopTokenTabs } from "../desktop-token-tabs";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  CircleDollarSign,
  Filter,
  Search,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import type {
  MarketToken,
  Position,
  Transaction,
} from "@/types/wallet";
import {
  useMarketTokens,
  useTransactions,
  useWalletPositions,
  useClosePosition,
} from "@/hooks/use-queries";

type SortBy = "marketCap" | "change";
type Timeframe =
  | "24h"
  | "7d"
  | "30d"
  | "all";

export interface ExchangePageProps {
  tokens?: MarketToken[];
  positions?: Position[];
  transactions?: Transaction[];
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

function ExchangePageInner({
  tokens: initialTokens = [],
  positions: initialPositions = [],
  transactions:
    initialTransactions = [],
}: ExchangePageProps) {
  const searchParams =
    useSearchParams();
  const projectFilter =
    searchParams.get("project");
  const tabParam =
    searchParams.get("tab");

  const {
    data: tokens = initialTokens,
    isLoading: isTokensLoading,
  } = useMarketTokens();
  const {
    data: positions = initialPositions,
    isLoading: isPositionsLoading,
  } = useWalletPositions();
  const {
    data: transactions = initialTransactions,
    isLoading: isTransactionsLoading,
  } = useTransactions();
  const {
    mutateAsync: closePositionMutate,
  } = useClosePosition();

  const isLoading =
    isTokensLoading ||
    isPositionsLoading ||
    isTransactionsLoading;

  const [activeTab, setActiveTab] =
    useState(tabParam || "market");

  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (tabParam)
      setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (isDesktop)
      setIsTokenDetailsOpen(false);
  }, [isDesktop]);

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
    isTokenDetailsOpen,
    setIsTokenDetailsOpen,
  ] = useState(false);

  const tokenBySymbol = useMemo(
    () =>
      new Map(
        tokens.map((t) => [t.symbol, t])
      ),
    [tokens]
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
    const totalGainUsd =
      totalValueUsd - totalCostUsd;
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
      await closePositionMutate(
        selectedPosition.id
      );
      // Optimistic update or invalidation handled by mutation hook
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
          if (!isDesktop)
            setIsTokenDetailsOpen(true);
        }}
        className={cn(
          "flex flex-col p-4 rounded-[28px] transition-all cursor-pointer border w-full",
          selectedTokenId === token.id
            ? cn(
                "bg-white border-primary z-10 relative",
                isDesktop
                  ? "shadow-xl scale-[1.02]"
                  : "shadow-lg"
              )
            : "bg-card border-border/40 hover:border-primary/30 shadow-sm"
        )}
      >
        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-4 items-center min-w-0">
            <div className="min-w-0">
              <div className="font-black text-[clamp(12px,3.5vw,14px)] uppercase text-[#3B2146] leading-tight truncate">
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
                    {formatPrice(
                      token.sellPriceUsd
                    )}
                  </Badge>
                )}
                {typeof token.buyPriceUsd ===
                  "number" && (
                  <Badge
                    variant="outline"
                    className="bg-brand-green/10 text-brand-green border-brand-green/20 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border h-auto"
                  >
                    {formatPrice(
                      token.buyPriceUsd
                    )}
                  </Badge>
                )}
              </div>
            )}

            <div className="text-right">
              <div className="text-[16px] font-black text-[#3B2146] leading-tight">
                {formatPrice(
                  token.priceUsd
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 rounded-full border-4 animate-spin border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden overflow-x-hidden flex-col h-full bg-background">
      {!isDesktop && (
        <header className="relative px-4 pt-4 pb-5 overflow-hidden shrink-0 text-white from-gray-900 shadow-xl bg-linear-to-br via-slate-900 to-violet-950">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10" />

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
              <h1 className="text-[clamp(20px,6.2vw,28px)] font-black tracking-tight leading-none text-white uppercase">
                Exchange
              </h1>
              <p className="mt-0.5 font-serif text-[clamp(11px,3.2vw,13px)] italic font-medium text-white/70">
                Mercado de Tokens
              </p>
            </div>
          </div>
        </header>
      )}

      <Dialog
        open={isOrderDetailsOpen}
        onOpenChange={
          setIsOrderDetailsOpen
        }
      >
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              Orden
            </DialogTitle>
          </DialogHeader>
          {selectedPosition ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-border/50 bg-background/40">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
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
                      {formatPrice(
                        selectedPosition.openedMarketPriceUsd ??
                          selectedPosition.orderPriceUsd
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border/50 bg-background/40">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                      Orden
                    </div>
                    <div className="mt-1 text-sm font-black">
                      {formatPrice(
                        selectedPosition.orderPriceUsd
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border/50 bg-background/40">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                      Mercado
                    </div>
                    <div className="mt-1 text-sm font-black">
                      {formatPrice(
                        selectedPosition.marketPriceUsd
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
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="font-mono font-black">
                            {formatPrice(
                              t.amount
                                .amount
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-center rounded-2xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                      No hay
                      transacciones
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl"
                  onClick={() =>
                    setIsOrderDetailsOpen(
                      false
                    )
                  }
                >
                  Cerrar
                </Button>
                <Button
                  className="flex-1 text-white rounded-2xl bg-brand-pink hover:bg-brand-pink/90"
                  disabled={
                    !isActivePosition(
                      selectedPosition
                    ) || isClosingOrder
                  }
                  onClick={() =>
                    void closeSelectedOrder()
                  }
                >
                  {isClosingOrder
                    ? "Cerrando..."
                    : "Cerrar orden"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {isDesktop ? (
        <div className="flex flex-1 min-h-0 divide-x bg-muted/5">
          <div className="flex relative z-10 flex-col w-1/3 border-r shadow-sm bg-background">
            <header className="relative px-6 py-6 bg-linear-to-br from-primary via-[#3B2146] to-black shadow-lg shrink-0">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
              <h1 className="relative z-10 text-2xl font-black text-white uppercase">
                Exchange
              </h1>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1 relative z-10">
                Mercado de Real Estate
                Tokenizado
              </p>
            </header>

            <Tabs
              value={activeTab}
              onValueChange={
                setActiveTab
              }
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="px-4 py-4 border-b bg-muted/10 shrink-0">
                <TabsList className="flex gap-1.5 w-full h-auto bg-transparent p-0 border-none">
                  <TabsTrigger
                    value="market"
                    className="flex-1 h-10 px-2 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Mercado
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="flex-1 h-10 px-2 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Favoritos
                  </TabsTrigger>
                  <TabsTrigger
                    value="positions"
                    className="flex-1 h-10 px-2 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Posiciones
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                <TabsContent
                  value="market"
                  className="mt-0 space-y-4"
                >
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-[10px] font-black uppercase rounded-xl"
                      onClick={() =>
                        setSortBy(
                          "marketCap"
                        )
                      }
                    >
                      Marketcap
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-[10px] font-black uppercase rounded-xl"
                      onClick={() =>
                        setSortBy(
                          "change"
                        )
                      }
                    >
                      % Var
                    </Button>
                  </div>
                  {filteredTokens.map(
                    (token) => (
                      <TokenRow
                        key={token.id}
                        token={token}
                      />
                    )
                  )}
                </TabsContent>
                <TabsContent
                  value="favorites"
                  className="mt-0 space-y-4"
                >
                  {favorites.map(
                    (token) => (
                      <TokenRow
                        key={token.id}
                        token={token}
                      />
                    )
                  )}
                </TabsContent>
                <TabsContent
                  value="positions"
                  className="mt-0 space-y-4"
                >
                  {activePositions.map(
                    (pos) => {
                      return (
                        <div
                          key={pos.id}
                          onClick={() => {
                            setSelectedPositionId(
                              pos.id
                            );
                            setIsOrderDetailsOpen(
                              true
                            );
                          }}
                          className="p-4 rounded-2xl border shadow-sm transition-all cursor-pointer bg-card hover:border-primary/50"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black">
                              {
                                pos.tokenSymbol
                              }
                            </span>
                            <Badge className="text-[10px] font-black">
                              {pos.side}
                            </Badge>
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
                            {formatPrice(
                              pos.marketPriceUsd
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="flex overflow-hidden relative flex-col flex-1 p-8 bg-muted/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_70%)] from-primary/5 to-transparent pointer-events-none" />
            {selectedToken ? (
              <div className="h-full duration-500 animate-in fade-in slide-in-from-right-8">
                <DesktopTokenTabs
                  token={selectedToken}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto p-12 rounded-[40px] border-2 border-dashed border-muted-foreground/20 bg-white/50 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-[30px] bg-primary/5 flex items-center justify-center mb-6">
                  <TrendingUp className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-black text-[#3B2146] uppercase mb-4">
                  Mercado de Capitales
                </h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  Selecciona un token de
                  la lista para ver el
                  análisis detallado,
                  planos de la propiedad
                  y ejecutar órdenes de
                  inversión.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 min-h-0 w-full"
          >
            <div className="px-4 py-4 bg-white shrink-0">
              <TabsList className="grid w-full grid-cols-3 gap-1.5 h-auto bg-transparent p-0 border-none">
                <TabsTrigger
                  value="market"
                  className="w-full min-w-0 h-11 px-2 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary overflow-hidden"
                >
                  <span className="truncate">
                    Mercado
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="w-full min-w-0 h-11 px-2 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary overflow-hidden"
                >
                  <span className="truncate">
                    Favoritos
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="positions"
                  className="w-full min-w-0 h-11 px-1 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary whitespace-normal leading-[1.05]"
                >
                  Mis Posiciones
                </TabsTrigger>
              </TabsList>
            </div>

            {activeTab === "market" && (
              <div className="flex overflow-x-auto gap-1.5 px-4 pb-4 bg-white border-b shrink-0 border-border/50 no-scrollbar">
                <Button
                  variant={
                    sortBy ===
                    "marketCap"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "rounded-xl h-8 px-2.5 transition-all text-[10px] uppercase font-black tracking-wider border shrink-0",
                    sortBy ===
                      "marketCap"
                      ? "shadow-sm bg-primary/80 text-primary-foreground border-primary"
                      : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                  )}
                  onClick={() =>
                    setSortBy(
                      "marketCap"
                    )
                  }
                >
                  CAP
                </Button>
                <Button
                  variant={
                    sortBy === "change"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "rounded-xl h-8 px-2.5 transition-all text-[10px] uppercase font-black tracking-wider border shrink-0",
                    sortBy === "change"
                      ? "shadow-sm bg-primary/80 text-primary-foreground border-primary"
                      : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                  )}
                  onClick={() =>
                    setSortBy("change")
                  }
                >
                  VAR
                </Button>

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
                      "rounded-xl px-2.5 h-8 text-[10px] font-black tracking-tighter transition-all border shrink-0",
                      timeframe ===
                        tf.toLowerCase()
                        ? "shadow-sm bg-primary/80 text-primary-foreground border-primary"
                        : "bg-transparent text-primary/60 border-transparent hover:bg-primary/10"
                    )}
                    onClick={() =>
                      setTimeframe(
                        tf.toLowerCase() as Timeframe
                      )
                    }
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto flex-1 min-h-0 w-full">
              <TabsContent
                value="market"
                className="p-4 mt-0 space-y-4 w-full max-w-[100vw] box-border"
              >
                <div className="flex flex-col gap-3 w-full">
                  <div className="grid gap-4 w-full">
                    {filteredTokens.length >
                    0 ? (
                      filteredTokens.map(
                        (token) => (
                          <TokenRow
                            key={
                              token.id
                            }
                            token={
                              token
                            }
                          />
                        )
                      )
                    ) : (
                      <div className="py-20 text-center rounded-3xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                        <Search className="mx-auto mb-3 w-10 h-10 opacity-20" />
                        <p className="text-sm font-medium">
                          No se
                          encontraron
                          tokens
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="favorites"
                className="p-4 mt-0 space-y-4"
              >
                <div className="grid gap-4">
                  {favorites.length >
                  0 ? (
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
                      <p className="text-sm font-medium">
                        No hay favoritos
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="positions"
                className="p-4 mt-0 space-y-4"
              >
                <header className="px-5 py-4 -mx-4 bg-white border-y border-border/40">
                  <div className="flex gap-4 justify-between items-end">
                    <div className="min-w-0">
                      <div className="text-[clamp(9px,2.6vw,10px)] text-muted-foreground font-black uppercase tracking-widest">
                        Total
                      </div>
                      <div className="text-[clamp(24px,7vw,32px)] font-black tracking-tight text-[#3B2146] truncate">
                        {formatCurrency(
                          summary.totalValueUsd
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-[clamp(10px,2.8vw,11px)] font-black uppercase whitespace-nowrap",
                          summary.totalGainUsd >=
                            0
                            ? "text-brand-green"
                            : "text-brand-pink"
                        )}
                      >
                        {summary.totalGainUsd >=
                        0
                          ? "+"
                          : "-"}
                        {formatPrice(
                          Math.abs(
                            summary.totalGainUsd
                          )
                        )}{" "}
                        (
                        {summary.gainPct >=
                        0
                          ? "+"
                          : ""}
                        {summary.gainPct.toFixed(
                          1
                        )}
                        %)
                      </div>
                    </div>
                  </div>
                </header>

                <div className="grid gap-4">
                  {activePositions.length >
                  0 ? (
                    activePositions.map(
                      (pos) => {
                        const token =
                          tokenBySymbol.get(
                            pos.tokenSymbol
                          );
                        const unitLabel =
                          token
                            ? (token.unitId ??
                              getUnitLabelFromSymbol(
                                token.symbol
                              ))
                            : getUnitLabelFromSymbol(
                                pos.tokenSymbol
                              );
                        const openedPrice =
                          pos.openedMarketPriceUsd ??
                          pos.orderPriceUsd;
                        const marketValueUsd =
                          pos.filledAmount *
                          pos.marketPriceUsd;
                        const costUsd =
                          pos.filledAmount *
                          openedPrice;
                        const gainUsd =
                          marketValueUsd -
                          costUsd;
                        const progress =
                          pos.totalAmount >
                          0
                            ? (pos.filledAmount /
                                pos.totalAmount) *
                              100
                            : 0;

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
                              setIsOrderDetailsOpen(
                                true
                              );
                            }}
                            className="p-5 rounded-[32px] border bg-white border-border/40 hover:border-primary/30 cursor-pointer transition-all shadow-sm"
                          >
                            <div className="flex gap-4 justify-between items-start">
                              <div className="flex gap-4 items-start min-w-0">
                                <div className="min-w-0">
                                  <div className="flex gap-2 items-center min-w-0">
                                    <span className="font-black text-[clamp(12px,3.8vw,14px)] uppercase text-[#3B2146] truncate min-w-0">
                                      {
                                        pos.tokenSymbol
                                      }
                                    </span>
                                  </div>
                                  <div className="flex gap-2 justify-between items-center mt-1">
                                    <div className="text-[clamp(9px,2.6vw,10px)] text-muted-foreground font-black uppercase tracking-widest truncate">
                                      {
                                        pos.filledAmount
                                      }{" "}
                                      /{" "}
                                      {
                                        pos.totalAmount
                                      }{" "}
                                      tokens
                                    </div>
                                    <Badge className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-none rounded-full font-black shrink-0">
                                      {Math.round(
                                        progress
                                      )}
                                      %
                                    </Badge>
                                  </div>
                                  <div className="mt-1 text-[clamp(9px,2.6vw,10px)] text-muted-foreground font-black uppercase tracking-widest">
                                    {pos.side ===
                                    "BUY"
                                      ? "Orden de compra"
                                      : "Orden de venta"}
                                  </div>
                                </div>
                              </div>

                              <div className="min-w-0 text-right">
                                <div className="text-[clamp(8px,2.4vw,9px)] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                  Valor
                                  Actual
                                </div>
                                <div className="text-[clamp(14px,4.6vw,17px)] font-black text-[#3B2146] leading-tight">
                                  {formatCurrency(
                                    marketValueUsd
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    "text-[clamp(9px,2.6vw,10px)] font-black uppercase mt-1",
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
                                  {formatPrice(
                                    Math.abs(
                                      gainUsd
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="py-20 text-center rounded-3xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                      <p className="text-sm font-medium">
                        No hay
                        posiciones
                        activas
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      <UnitDetailsDialog
        isOpen={
          !isDesktop &&
          isTokenDetailsOpen
        }
        onClose={() =>
          setIsTokenDetailsOpen(false)
        }
        data={selectedToken}
      />
    </div>
  );
}

export default function ExchangePage(
  props: ExchangePageProps
) {
  return (
    <Suspense fallback={null}>
      <ExchangePageInner {...props} />
    </Suspense>
  );
}
