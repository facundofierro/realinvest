"use client";

import {
  formatCurrency,
  formatPrice,
  formatTokenAmount,
} from "@/lib/format";
import {
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  useWalletHoldings,
  useWalletBalances,
  useWalletPositions,
  useMarketTokens,
} from "@/hooks/use-queries";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { DesktopTokenTabs } from "../desktop-token-tabs";
import { UnitDetailsDialog } from "../unit-details-dialog";
import { UnitDetailsActions } from "../unit-details-actions";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  TrendingUp,
  Wallet,
  X,
  PieChart,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

export default function AssetsPage() {
  const router = useRouter();
  const { data: holdings = [] } =
    useWalletHoldings();
  const { data: balances = [] } =
    useWalletBalances();
  const { data: positions = [] } =
    useWalletPositions();
  const { data: marketTokens = [] } =
    useMarketTokens();

  const isDesktop = useIsDesktop();

  const [
    selectedTokenId,
    setSelectedTokenId,
  ] = useState<string | null>(null);

  const myTokens = useMemo(() => {
    return holdings.map((holding) => {
      const position = positions.find(
        (p) =>
          p.tokenSymbol ===
            holding.tokenSymbol &&
          p.status === "OPEN"
      );
      return {
        ...holding,
        tokenName: holding.tokenSymbol,
        projectName:
          holding.projectTitle,
        marketPrice: String(
          holding.marketPriceUsd
        ),
        value:
          holding.tokens *
          holding.marketPriceUsd,
        orderPrice: position
          ? String(
              position.orderPriceUsd
            )
          : null,
        change: holding.changePct
          ? `${holding.changePct > 0 ? "+" : ""}${holding.changePct}%`
          : "+0.0%",
        unitId: holding.unitCode,
        color: "bg-primary",
        borderColor: "border-primary",
      };
    });
  }, [holdings, positions]);

  const selectedToken = useMemo(() => {
    return (
      myTokens.find(
        (t) => t.id === selectedTokenId
      ) || null
    );
  }, [myTokens, selectedTokenId]);

  const totalValue = useMemo(() => {
    return myTokens.reduce(
      (acc, t) => acc + t.value,
      0
    );
  }, [myTokens]);

  const availableUsdt = useMemo(() => {
    return (
      balances.find(
        (b) => b.currencyCode === "USDT"
      )?.available ?? 0
    );
  }, [balances]);

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

  const marketPrice = selectedToken
    ? Number(
        selectedToken.marketPrice
      ) || 0
    : 0;
  const ownedTokens = selectedToken
    ? selectedToken.tokens
    : 0;

  const handleMax = () => {
    if (!selectedToken) return;
    if (tradeType === "SELL") {
      setAmount(String(ownedTokens));
      return;
    }
    const p =
      marketPrice > 0 ? marketPrice : 0;
    const maxByBalance =
      p > 0 ? availableUsdt / p : 0;
    setAmount(
      String(maxByBalance.toFixed(4))
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isDesktop ? (
        <div className="flex flex-1 min-h-0 divide-x bg-muted/5">
          <div className="w-1/3 min-w-[400px] flex flex-col bg-background relative z-10 border-r shadow-sm">
            <header className="p-6 bg-linear-to-br from-[#1a1c2e] to-[#0f172a] text-white">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Valor Total Portafolio
                </span>
                <div className="text-3xl font-black tracking-tighter">
                  {formatCurrency(
                    totalValue
                  )}
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-brand-green text-[10px] font-black bg-brand-green/10 px-2 py-0.5 rounded-full">
                    +12.5%
                  </span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Último mes
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  variant="outline"
                  className="h-10 text-[10px] font-black uppercase bg-white/5 border-white/10 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/deposit">
                    <ArrowDownLeft className="mr-2 h-4 w-4" />{" "}
                    Ingresar
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 text-[10px] font-black uppercase bg-white/5 border-white/10 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/withdraw">
                    <ArrowUpRight className="mr-2 h-4 w-4" />{" "}
                    Retirar
                  </Link>
                </Button>
              </div>
            </header>

            <div className="p-4 border-b bg-muted/5 flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Mis Activos
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] font-black uppercase"
              >
                {myTokens.length} Tokens
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <Card className="p-4 border-none bg-primary/5 shadow-none mb-4">
                <div className="flex justify-between items-center text-primary">
                  <div className="flex gap-3 items-center">
                    <Wallet className="h-5 w-5 opacity-60" />
                    <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                      Liquidez USDT
                    </span>
                  </div>
                  <span className="font-black text-lg">
                    {formatCurrency(
                      availableUsdt
                    )}
                  </span>
                </div>
              </Card>

              {myTokens.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() =>
                    setSelectedTokenId(
                      asset.id
                    )
                  }
                  className={cn(
                    "p-4 rounded-3xl border transition-all cursor-pointer flex justify-between items-center group",
                    selectedTokenId ===
                      asset.id
                      ? "bg-white border-primary shadow-xl scale-[1.02] z-10 relative"
                      : "bg-card border-border/40 hover:border-primary/30 shadow-sm"
                  )}
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="min-w-0">
                      <div className="font-black text-[13px] uppercase text-[#3B2146] truncate">
                        {
                          asset.tokenName
                        }
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase truncate mt-0.5">
                        {
                          asset.projectName
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm">
                      {formatCurrency(
                        asset.value
                      )}
                    </div>
                    <div className="text-[9px] font-black text-brand-green uppercase mt-0.5">
                      {asset.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-8 bg-muted/10 overflow-hidden">
            {selectedToken ? (
              <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500">
                <DesktopTokenTabs
                  token={{
                    id: selectedToken.id,
                    symbol:
                      selectedToken.tokenName,
                    projectTitle:
                      selectedToken.projectName,
                    priceUsd: Number(
                      selectedToken.marketPrice
                    ),
                    tokensAvailable: 1250,
                    marketCapUsd: 520000,
                    projectId: "1",
                    change24hPct: 0.5,
                    change7dPct: 2.1,
                    change30dPct: 5.4,
                    changeAllPct: 12.4,
                    isFavorite: true,
                    roiPct: 12.4,
                    unitId:
                      selectedToken.unitId,
                    sellPriceUsd:
                      Number(
                        selectedToken.marketPrice
                      ),
                    buyPriceUsd: Number(
                      selectedToken.marketPrice
                    ),
                    liveSince:
                      "6 meses",
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto p-12 rounded-[40px] border-2 border-dashed border-muted-foreground/20 bg-white/50 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-[30px] bg-primary/5 flex items-center justify-center mb-6">
                  <PieChart className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-black text-[#3B2146] uppercase mb-4">
                  Análisis de Portafolio
                </h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Selecciona uno de tus
                  activos para ver el
                  rendimiento histórico,
                  la distribución de
                  dividendos y los
                  planos de la unidad.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-50">
            <Card className="overflow-hidden relative text-white from-gray-900 rounded-none border-none shadow-xl bg-linear-to-br via-slate-900 to-violet-950">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10" />

              <CardContent className="relative z-10 p-6 pt-8 space-y-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-white/60">
                    Valor Total
                  </span>
                  <div className="text-4xl font-bold tracking-tighter">
                    {formatCurrency(
                      totalValue
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="inline-flex items-center text-brand-green text-sm font-medium bg-brand-green/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="mr-1 w-3 h-3" />
                      +12.5%
                    </span>
                    <span className="text-xs text-white/40">
                      último mes
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button
                    variant="ghost"
                    className="w-full h-11 text-xs font-bold text-white rounded-2xl border shadow-none backdrop-blur-md border-white/10 bg-white/5 hover:bg-white/5"
                    asChild
                  >
                    <Link href="/deposit">
                      <ArrowDownLeft className="mr-2 w-4 h-4" />{" "}
                      Ingresar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-11 text-xs font-bold text-white rounded-2xl border shadow-none backdrop-blur-md border-white/10 bg-white/5 hover:bg-white/5"
                    asChild
                  >
                    <Link href="/withdraw">
                      <ArrowUpRight className="mr-2 w-4 h-4" />{" "}
                      Retirar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <h2 className="px-1 text-sm font-bold tracking-wider uppercase text-muted-foreground">
                Liquidez
              </h2>
              <Card className="overflow-hidden border-none shadow-sm transition-all bg-card group hover:shadow-md">
                <CardContent className="flex p-0 border-l-4 border-primary">
                  <div className="flex flex-1 justify-between items-center p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl transition-transform bg-primary/10 group-hover:scale-110">
                        <Wallet className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          Liquidez
                          Disponible
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          USDT (TRC20)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(
                          availableUsdt
                        )}
                      </p>
                      <div className="flex gap-2 justify-end mt-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          href="/deposit"
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Depositar
                        </Link>
                        <span className="text-muted-foreground text-[10px]">
                          •
                        </span>
                        <Link
                          href="/withdraw"
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Retirar
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 pb-24">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
                  Mis Tokens
                </h2>
              </div>

              <div className="space-y-4">
                {myTokens.map(
                  (asset) => (
                    <Card
                      key={asset.id}
                      onClick={() =>
                        setSelectedTokenId(
                          asset.id
                        )
                      }
                      className={cn(
                        "overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all group rounded-[28px] bg-card cursor-pointer",
                        selectedTokenId ===
                          asset.id
                          ? "ring-2 ring-primary"
                          : ""
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="grid grid-cols-[1fr_120px] items-center gap-x-4">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="min-w-0">
                              <div className="font-black text-[14px] uppercase text-[#3B2146] leading-tight truncate">
                                {
                                  asset.tokenName
                                }
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase truncate">
                                  {
                                    asset.projectName
                                  }
                                </div>
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground/60 flex items-center tracking-widest uppercase mt-0.5">
                                {
                                  asset.location
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end text-right">
                            <div className="text-lg font-black text-[#3B2146] tracking-tighter">
                              {formatCurrency(
                                asset.value
                              )}
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                              {formatTokenAmount(
                                asset.tokens
                              )}
                            </div>
                            {asset.orderPrice && (
                              <Badge
                                variant="outline"
                                className="mt-1 bg-brand-pink/10 text-brand-pink border-brand-pink/20 text-[8px] px-2 py-0.5 h-auto font-black uppercase tracking-tighter"
                              >
                                Posición:
                                {formatCurrency(
                                  Number(
                                    asset.orderPrice
                                  )
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <UnitDetailsDialog
        isOpen={
          !isDesktop &&
          !!selectedTokenId &&
          !isTradeDialogOpen
        }
        onClose={() =>
          setSelectedTokenId(null)
        }
        data={
          selectedToken
            ? {
                symbol:
                  selectedToken.tokenName,
                projectTitle:
                  selectedToken.projectName,
                priceUsd: Number(
                  selectedToken.marketPrice.replace(
                    /,/g,
                    ""
                  )
                ),
                tokensAvailable: 1250,
                marketCapUsd: 520000,
                id: selectedToken.id,
                projectId: "1",
                change24hPct: 0.5,
                change7dPct: 2.1,
                change30dPct: 5.4,
                changeAllPct: 12.4,
                liveSince: "6 meses",
                isFavorite: true,
                roiPct: 12.4,
                buyPriceUsd: Number(
                  selectedToken.marketPrice.replace(
                    /,/g,
                    ""
                  )
                ),
                sellPriceUsd: Number(
                  selectedToken.marketPrice.replace(
                    /,/g,
                    ""
                  )
                ),
              }
            : null
        }
        onInvest={() => {
          setTradeType("BUY");
          setOrderType("MARKET");
          setIsTradeDialogOpen(true);
        }}
      />

      <Dialog
        open={
          isTradeDialogOpen &&
          !!selectedToken
        }
        onOpenChange={
          setIsTradeDialogOpen
        }
      >
        <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-[1.05]">
                <span>
                  {tradeType === "BUY"
                    ? "Comprar"
                    : "Vender"}
                </span>
                <span className="block text-2xl font-black tracking-tight text-muted-foreground">
                  {
                    selectedToken?.tokenName
                  }
                </span>
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
                      onClick={
                        handleMax
                      }
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Max:{" "}
                      {tradeType ===
                      "SELL"
                        ? formatTokenAmount(
                            ownedTokens
                          )
                        : formatCurrency(
                            availableUsdt
                          )}
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
                            e.target
                              .value
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
                          {marketPrice >
                          0
                            ? formatPrice(
                                marketPrice
                              )
                            : "Mercado"}
                        </div>
                      ) : (
                        <Input
                          value={
                            limitPriceInput
                          }
                          onChange={(
                            e
                          ) =>
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
                </div>

                <Button
                  className="w-full h-12 mt-6 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/25"
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
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
