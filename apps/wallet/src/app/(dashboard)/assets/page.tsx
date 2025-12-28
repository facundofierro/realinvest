"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  Building2,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

export default function AssetsPage() {
  const myTokens = [
    {
      id: "1",
      unitId: "12A",
      tokenName: "VEX-TORRE-L-12-A",
      projectName:
        "Torre Libertador 8000",
      location: "Nuñez, BA",
      tokens: "500.00",
      value: "52,000.00",
      change: "+5.2%",
      marketPrice: "104.00",
      orderPrice: "100.00",
      color: "bg-blue-500",
      borderColor: "border-blue-500",
    },
    {
      id: "2",
      unitId: "P1",
      tokenName: "VEX-CEIBO-P1-04",
      projectName: "Barrio El Ceibo",
      location: "Pilar, BA",
      tokens: "3,500.00",
      value: "38,500.00",
      change: "+12.1%",
      marketPrice: "11.00",
      orderPrice: null,
      color: "bg-emerald-500",
      borderColor: "border-emerald-500",
    },
    {
      id: "3",
      unitId: "JR",
      tokenName: "VEX-OFFICE-JR-02",
      projectName: "Complex Office Jr",
      location: "Palermo, BA",
      tokens: "120.00",
      value: "15,000.00",
      change: "+1.8%",
      marketPrice: "125.00",
      orderPrice: "118.00",
      color: "bg-orange-500",
      borderColor: "border-orange-500",
    },
  ];

  const router = useRouter();
  const [
    selectedToken,
    setSelectedToken,
  ] = useState<
    (typeof myTokens)[0] | null
  >(null);

  return (
    <div className="pb-24 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Main Balance Card - Fixed at top with no margins */}
      <div className="sticky top-0 z-50">
        <Card className="overflow-hidden relative text-white from-gray-900 rounded-none border-none shadow-xl bg-linear-to-br via-slate-900 to-violet-950">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10"></div>

          <CardContent className="relative z-10 p-6 pt-8 space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-white/60">
                Valor Total
              </span>
              <div className="text-4xl font-bold tracking-tighter">
                $ 124,500.00
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
        {/* Liquidity First */}
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
                    $ 19,000.00
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

        {/* Token List */}
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
                  setSelectedToken(
                    asset
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
                        $ {asset.value}
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

      {selectedToken && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-300">
          <div className="bg-card/95 backdrop-blur-3xl border border-primary/30 shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.4)] rounded-[32px] p-6 overflow-hidden relative">
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                setSelectedToken(null)
              }
              className="absolute top-6 right-6 z-50 w-9 h-9 bg-white rounded-full border-none shadow-lg hover:bg-white/90 text-slate-500"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                      {
                        selectedToken.tokenName
                      }
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    {
                      selectedToken.projectName
                    }
                  </h3>
                  <div className="flex flex-col gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="flex gap-1.5 items-center">
                      <Building2 className="w-3.5 h-3.5" />{" "}
                      {
                        selectedToken.location
                      }
                    </span>
                    <span className="flex gap-1.5 items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-muted/50" />
                      {
                        selectedToken.tokens
                      }{" "}
                      TOKENS
                    </span>
                  </div>
                </div>
                <div className="mt-10 text-right">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                    Valor Total
                  </div>
                  <div className="text-xl font-black text-foreground">
                    ${" "}
                    {
                      selectedToken.value
                    }
                  </div>
                  <div className="text-[10px] font-black text-brand-green uppercase mt-0.5">
                    {
                      selectedToken.change
                    }
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push(
                      `/exchange?tab=positions`
                    );
                  }}
                  className="flex-1 h-14 text-[10px] font-black tracking-widest uppercase rounded-xl border-border/50 hover:bg-muted"
                >
                  POSICIONES
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.tokenName
                      );
                    router.push(
                      `/exchange/${symbol}/sell`
                    );
                  }}
                  className="flex-1 h-14 text-[10px] font-black tracking-widest uppercase rounded-xl border-border/50 hover:bg-muted"
                >
                  VENDER
                </Button>
                <Button
                  className="flex-[1.5] h-14 rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px]"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.tokenName
                      );
                    router.push(
                      `/exchange/${symbol}/buy`
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
