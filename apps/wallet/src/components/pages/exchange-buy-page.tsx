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
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Lock,
  Wallet,
} from "lucide-react";
import type {
  MarketToken,
  WalletBalance,
} from "@/types/wallet";

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function parseAmount(
  value: string
): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(
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

export interface ExchangeBuyPageProps {
  token: MarketToken;
  usdtBalance: WalletBalance;
}

export default function ExchangeBuyPage({
  token,
  usdtBalance,
}: ExchangeBuyPageProps) {
  const router = useRouter();
  const symbol = token.symbol;

  const [
    marketAmount,
    setMarketAmount,
  ] = useState<string>("");
  const [orderAmount, setOrderAmount] =
    useState<string>("");
  const [orderPrice, setOrderPrice] =
    useState<string>(
      token.priceUsd
        ? String(
            token.priceUsd.toFixed(2)
          )
        : ""
    );

  const price = token.priceUsd;
  const availableUsdt =
    usdtBalance.available;

  const maxMarketByBalance =
    price > 0
      ? availableUsdt / price
      : 0;
  const maxMarketByBook =
    token.tokensAvailable ??
    Number.POSITIVE_INFINITY;
  const maxMarketAmount = clamp(
    Math.min(
      maxMarketByBalance,
      maxMarketByBook
    ),
    0,
    1_000_000_000
  );

  const marketAmountNum = clamp(
    parseAmount(marketAmount),
    0,
    maxMarketAmount
  );
  const marketTotal =
    marketAmountNum * price;

  const orderPriceNumRaw =
    parseAmount(orderPrice);
  const orderPriceNum = clamp(
    orderPriceNumRaw,
    0,
    1_000_000_000
  );
  const maxOrderAmount =
    orderPriceNum > 0
      ? availableUsdt / orderPriceNum
      : 0;
  const orderAmountNum = clamp(
    parseAmount(orderAmount),
    0,
    maxOrderAmount
  );
  const orderTotal =
    orderAmountNum * orderPriceNum;

  return (
    <div className="flex flex-col pb-28 min-h-screen bg-background">
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
              Comprar
            </h1>
            <p className="text-xs italic font-medium text-white/70">
              {token.projectTitle}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card className="border border-primary/10 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex gap-4 justify-between items-start">
              <div className="space-y-1">
                <div className="font-mono text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter w-fit">
                  {token.symbol}
                </div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Precio mercado
                </div>
                <div className="text-2xl font-black tracking-tighter text-foreground">
                  ${price.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="flex gap-2 justify-end items-center text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    USDT disponible
                  </span>
                </div>
                <div className="text-xl font-black tracking-tighter text-foreground">
                  {formatMoney(
                    availableUsdt
                  )}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Bloqueado:{" "}
                  {formatMoney(
                    usdtBalance.locked
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          defaultValue="mercado"
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 p-1 w-full h-12 rounded-2xl border bg-primary/5 border-primary/10">
            <TabsTrigger
              value="mercado"
              className="rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/60 data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
            >
              Mercado
            </TabsTrigger>
            <TabsTrigger
              value="orden"
              className="rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/60 data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
            >
              Orden
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="mercado"
            className="mt-4"
          >
            <Card className="border backdrop-blur border-border/60 bg-card/80">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Comprar al precio de
                    mercado
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMarketAmount(
                        String(
                          maxMarketAmount.toFixed(
                            4
                          )
                        )
                      )
                    }
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Max
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest">
                    Cantidad
                  </Label>
                  <div className="relative">
                    <Input
                      inputMode="decimal"
                      value={
                        marketAmount
                      }
                      onChange={(e) =>
                        setMarketAmount(
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className="pr-20 h-12 font-black rounded-2xl"
                    />
                    <div className="absolute right-3 top-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tokens
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Máximo</span>
                    <span>
                      {formatMoney(
                        maxMarketAmount
                      )}{" "}
                      tokens
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-3xl border border-border/50 bg-linear-to-br from-primary/5 via-background to-violet-500/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Total estimado
                    </span>
                    <span className="text-xl font-black tracking-tighter text-foreground">
                      {formatMoney(
                        marketTotal
                      )}{" "}
                      USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Precio</span>
                    <span>
                      $
                      {price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20",
                    marketAmountNum > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                  disabled={
                    marketAmountNum <=
                      0 ||
                    marketTotal >
                      availableUsdt
                  }
                >
                  Confirmar compra
                  (mercado)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="orden"
            className="mt-4"
          >
            <Card className="border backdrop-blur border-border/60 bg-card/80">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Colocar una orden
                    (límite)
                  </div>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Bloquea USDT
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest">
                      Precio
                    </Label>
                    <div className="relative">
                      <span className="absolute top-3 left-3 font-black text-muted-foreground">
                        $
                      </span>
                      <Input
                        inputMode="decimal"
                        value={
                          orderPrice
                        }
                        onChange={(e) =>
                          setOrderPrice(
                            e.target
                              .value
                          )
                        }
                        placeholder="0.00"
                        className="pl-6 h-12 font-black rounded-2xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest">
                      Cantidad
                    </Label>
                    <div className="relative">
                      <Input
                        inputMode="decimal"
                        value={
                          orderAmount
                        }
                        onChange={(e) =>
                          setOrderAmount(
                            e.target
                              .value
                          )
                        }
                        placeholder="0.00"
                        className="pr-20 h-12 font-black rounded-2xl"
                      />
                      <div className="absolute right-3 top-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Tokens
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Máximo</span>
                  <span>
                    {formatMoney(
                      maxOrderAmount
                    )}{" "}
                    tokens
                  </span>
                </div>

                <div className="p-4 space-y-2 rounded-3xl border border-border/50 bg-linear-to-br from-primary/5 via-background to-violet-500/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Total (orden)
                    </span>
                    <span className="text-xl font-black tracking-tighter text-foreground">
                      {formatMoney(
                        orderTotal
                      )}{" "}
                      USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>
                      Bloqueado
                    </span>
                    <span>
                      {formatMoney(
                        orderTotal
                      )}{" "}
                      USDT
                    </span>
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20",
                    orderAmountNum >
                      0 &&
                      orderPriceNum > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                  disabled={
                    orderAmountNum <=
                      0 ||
                    orderPriceNum <=
                      0 ||
                    orderTotal >
                      availableUsdt
                  }
                >
                  Colocar orden de
                  compra
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
