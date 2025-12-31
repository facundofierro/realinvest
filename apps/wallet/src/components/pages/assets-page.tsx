"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalletHoldings, useWalletBalances, useWalletPositions, useMarketTokens } from "@/hooks/use-queries";
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
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

export default function AssetsPage() {
  const router = useRouter();
  const { data: holdings = [] } = useWalletHoldings();
  const { data: balances = [] } = useWalletBalances();
  const { data: positions = [] } = useWalletPositions();
  const { data: marketTokens = [] } = useMarketTokens();

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  
  const myTokens = useMemo(() => {
    return holdings.map(holding => {
      const position = positions.find(p => p.tokenSymbol === holding.tokenSymbol && p.status === "OPEN");
      return {
        ...holding,
        tokenName: holding.tokenSymbol,
        projectName: holding.projectTitle,
        marketPrice: String(holding.marketPriceUsd),
        value: holding.tokens * holding.marketPriceUsd,
        orderPrice: position ? String(position.orderPriceUsd) : null,
        change: holding.changePct ? `${holding.changePct > 0 ? "+" : ""}${holding.changePct}%` : "+0.0%",
        unitId: holding.unitCode,
        color: "bg-primary",
        borderColor: "border-primary"
      };
    });
  }, [holdings, positions]);

  const selectedToken = useMemo(() => {
    return myTokens.find(t => t.id === selectedTokenId) || null;
  }, [myTokens, selectedTokenId]);

  const totalValue = useMemo(() => {
    return myTokens.reduce((acc, t) => acc + t.value, 0);
  }, [myTokens]);

  const availableUsdt = useMemo(() => {
    return balances.find(b => b.currencyCode === "USDT")?.available ?? 0;
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
    ? Number(selectedToken.marketPrice) || 0
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
    const p = marketPrice > 0 ? marketPrice : 0;
    const maxByBalance = p > 0 ? availableUsdt / p : 0;
    setAmount(String(maxByBalance.toFixed(4)));
  };

  return (
    <div className="pb-24 duration-500 animate-in fade-in slide-in-from-bottom-4">
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
                $ {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    $ {availableUsdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
              Mis Tokens
            </h2>
          </div>

          <div className="space-y-4">
            {myTokens.map((asset) => (
              <Card
                key={asset.id}
                onClick={() =>
                  setSelectedTokenId(
                    asset.id
                  )
                }
                className={cn(
                  "overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all group rounded-[28px] bg-card cursor-pointer",
                  selectedToken?.id ===
                    asset.id
                    ? "ring-2 ring-primary"
                    : ""
                )}
              >
                <CardContent className="p-5">
                  <div className="grid grid-cols-[1fr_120px] items-center gap-x-4">
                    <div className="flex gap-3 items-center min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors shrink-0",
                          "bg-muted/30 text-[#3B2146] border border-border/50"
                        )}
                      >
                        {asset.unitId}
                      </div>
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
                          <Building2 className="h-2.5 w-2.5 mr-1" />{" "}
                          {
                            asset.location
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end text-right">
                      <div className="text-lg font-black text-[#3B2146] tracking-tighter">
                        $ {asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        {asset.tokens}{" "}
                        Tokens
                      </div>
                      {asset.orderPrice && (
                        <Badge
                          variant="outline"
                          className="mt-1 bg-brand-pink/10 text-brand-pink border-brand-pink/20 text-[8px] px-2 py-0.5 h-auto font-black uppercase tracking-tighter"
                        >
                          Posición: $
                          {
                            asset.orderPrice
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <UnitDetailsDialog
        isOpen={!!selectedTokenId && !isTradeDialogOpen}
        onClose={() => setSelectedTokenId(null)}
        data={selectedToken ? {
          symbol: selectedToken.tokenName,
          projectTitle: selectedToken.projectName,
          priceUsd: Number(selectedToken.marketPrice.replace(/,/g, "")),
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
          roiPct: 12.4
        } : null}
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
                        ? ownedTokens.toFixed(
                            2
                          )
                        : `$${availableUsdt.toFixed(2)}`}
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
                            ? `$${marketPrice.toFixed(2)}`
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
