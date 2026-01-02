"use client";

import { UnitDetailsDialog } from "../unit-details-dialog";
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
import { Card } from "@repo/ui/components/ui/card";
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
    <div className="flex overflow-hidden flex-col h-full bg-background">
      {!isDesktop && (
        <header className="relative px-4 pt-6 pb-8 bg-linear-to-br from-primary via-[#3B2146] to-black shadow-xl border-none overflow-hidden shrink-0">
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
              <h1 className="text-3xl font-black tracking-tight leading-none text-white uppercase">
                Exchange
              </h1>
              <p className="mt-1 font-serif text-sm italic font-medium text-white/70">
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
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="font-mono font-black">
                            $
                            {formatUsd(
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
          <div className="w-1/3 min-w-[400px] flex flex-col bg-background relative z-10 border-r shadow-sm">
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
                            $
                            {pos.marketPriceUsd.toFixed(
                              2
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
            className="w-full"
          >
            <div className="px-4 py-4 border-b border-border/50 bg-muted/10 shrink-0">
              <TabsList className="flex items-center gap-1.5 w-full h-auto bg-transparent p-0 border-none">
                <TabsTrigger
                  value="market"
                  className="flex-1 min-w-0 h-11 px-2 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
                >
                  Mercado
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="flex-1 min-w-0 h-11 px-2 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
                >
                  Favoritos
                </TabsTrigger>
                <TabsTrigger
                  value="positions"
                  className="flex-1 min-w-0 h-11 px-2 rounded-2xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
                >
                  Mis Posiciones
                </TabsTrigger>
                <button
                  type="button"
                  className="flex justify-center items-center w-11 h-11 rounded-2xl border shrink-0 bg-primary/10 text-primary border-primary/20"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </TabsList>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0">
              <TabsContent
                value="market"
                className="p-4 mt-0 space-y-4"
              >
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
                              tf.toLowerCase() as Timeframe
                            )
                          }
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
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
                <Card className="p-5 rounded-[32px] border-none shadow-sm bg-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        Total
                      </div>
                      <div className="text-3xl font-black tracking-tight text-[#3B2146]">
                        $
                        {formatUsd(
                          summary.totalValueUsd
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-[11px] font-black uppercase",
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
                        $
                        {formatUsd(
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
                </Card>

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
                                <div className="w-10 h-10 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center font-black text-xs text-[#3B2146] shrink-0">
                                  {
                                    unitLabel
                                  }
                                </div>
                                <div className="min-w-0">
                                  <div className="flex gap-2 items-center">
                                    <span className="font-black text-[14px] uppercase text-[#3B2146] truncate">
                                      {
                                        pos.tokenSymbol
                                      }
                                    </span>
                                    <Badge className="text-[8px] h-4 px-2 bg-primary/10 text-primary border-none rounded-full font-black">
                                      {
                                        pos.status
                                      }
                                    </Badge>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                                    {
                                      pos.filledAmount
                                    }{" "}
                                    /{" "}
                                    {
                                      pos.totalAmount
                                    }{" "}
                                    TOKENS
                                  </div>
                                  <div className="flex gap-2 items-center mt-1">
                                    <Badge className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-none rounded-full font-black">
                                      {Math.round(
                                        progress
                                      )}
                                      %
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                      {
                                        pos.side
                                      }
                                    </span>
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
