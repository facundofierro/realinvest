"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  formatCurrency,
  formatPrice,
  formatTokenAmount,
} from "@/lib/format";
import type { MarketToken } from "@/types/wallet";

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token: MarketToken;
  tradeType: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  onOrderTypeChange: (
    type: "MARKET" | "LIMIT"
  ) => void;
  amount: string;
  onAmountChange: (
    value: string
  ) => void;
  limitPriceInput: string;
  onLimitPriceInputChange: (
    value: string
  ) => void;
  userBalance: number;
  userTokens: number;
  marketTradePrice: number;
  marketSimulation: {
    avgPrice: number;
    fills: Array<{
      price: number;
      amount: number;
    }>;
  } | null;
  onMax: () => void;
  onConfirm: () => void;
}

export function TradeDialog({
  isOpen,
  onOpenChange,
  token,
  tradeType,
  orderType,
  onOrderTypeChange,
  amount,
  onAmountChange,
  limitPriceInput,
  onLimitPriceInputChange,
  userBalance,
  userTokens,
  marketTradePrice,
  marketSimulation,
  onMax,
  onConfirm,
}: TradeDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="p-0 w-[calc(100%-2rem)] max-w-[440px] overflow-hidden rounded-[32px] data-[state=open]:[--tw-enter-translate-x:0] data-[state=open]:[--tw-enter-translate-y:0] data-[state=closed]:[--tw-exit-translate-x:0] data-[state=closed]:[--tw-exit-translate-y:0]">
        <DialogTitle className="sr-only">
          {tradeType === "BUY"
            ? "Comprar"
            : "Vender"}{" "}
          {token.symbol}
        </DialogTitle>
        <div className="p-4 sm:p-6 space-y-5 max-h-[85dvh] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex gap-4 justify-between items-start">
              <div className="min-w-0">
                <div className="flex gap-2 items-center">
                  <span className="font-mono text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                    {token.symbol}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {tradeType === "BUY"
                      ? "COMPRAR"
                      : "VENDER"}
                  </span>
                </div>
                <div className="mt-2 text-base font-black leading-tight uppercase text-foreground">
                  {token.projectTitle}
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tradeType === "BUY"
                    ? `SALDO: ${formatCurrency(userBalance)}`
                    : `DISPONIBLE: ${formatTokenAmount(userTokens)} ${token.symbol}`}
                </div>
              </div>
              <div className="pt-6 pr-10 text-right shrink-0">
                <div className="text-2xl font-black tracking-tighter text-foreground">
                  {formatPrice(
                    token.priceUsd
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <Tabs
              value={orderType}
              onValueChange={(v) =>
                onOrderTypeChange(
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
                      onClick={onMax}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Max:{" "}
                      {tradeType ===
                      "SELL"
                        ? formatTokenAmount(
                            userTokens
                          )
                        : formatCurrency(
                            userBalance
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
                          onAmountChange(
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
                          {formatPrice(
                            marketSimulation?.avgPrice ||
                              marketTradePrice
                          )}
                        </div>
                      ) : (
                        <Input
                          value={
                            limitPriceInput
                          }
                          onChange={(
                            e
                          ) =>
                            onLimitPriceInputChange(
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

                  {orderType ===
                    "MARKET" &&
                    marketSimulation &&
                    marketSimulation
                      .fills.length >
                      0 && (
                      <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/10">
                        <div className="flex justify-between items-center px-4 py-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Órdenes
                            ejecutadas
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Prom:{" "}
                            {formatPrice(
                              marketSimulation.avgPrice
                            )}
                          </span>
                        </div>
                        <div className="divide-y divide-border/40">
                          {marketSimulation.fills.map(
                            (
                              fill,
                              idx
                            ) => (
                              <div
                                key={
                                  idx
                                }
                                className="flex justify-between items-center px-4 py-2"
                              >
                                <span
                                  className={cn(
                                    "font-mono text-xs font-bold",
                                    tradeType ===
                                      "BUY"
                                      ? "text-red-400"
                                      : "text-emerald-400"
                                  )}
                                >
                                  $
                                  {fill.price.toFixed(
                                    2
                                  )}
                                </span>
                                <span className="font-mono text-xs font-medium text-muted-foreground">
                                  {fill.amount.toFixed(
                                    4
                                  )}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={onConfirm}
                    disabled={
                      !amount ||
                      Number(amount) <=
                        0
                    }
                    className={cn(
                      "w-full h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
                      tradeType ===
                        "BUY"
                        ? "bg-brand-green hover:bg-brand-green/90 text-white"
                        : "bg-brand-pink hover:bg-brand-pink/90 text-white"
                    )}
                  >
                    Confirmar{" "}
                    {tradeType === "BUY"
                      ? "Compra"
                      : "Venta"}
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
