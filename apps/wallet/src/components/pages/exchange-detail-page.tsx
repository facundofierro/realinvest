"use client";

import {
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
// Custom chart implementation - SVG based
import type {
  MarketToken,
  MarketOrderBook,
  MarketSeries,
  Position,
} from "@/types/wallet";

function LineChart({
  series,
  isUp,
  currentPrice,
}: {
  series: number[];
  isUp: boolean;
  currentPrice: number;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const w = 320;
  const h = 200;
  const padRight = 45;
  const padTop = 10;
  const padBottom = 10;

  const getRealPrice = (
    val: number
  ) => {
    const lastVal =
      series[series.length - 1];
    return (
      (val / lastVal) * currentPrice
    );
  };

  const d = series
    .map((v, i) => {
      const x =
        (i /
          Math.max(
            1,
            series.length - 1
          )) *
        (w - padRight);
      const y =
        h -
        padBottom -
        ((v - min) /
          Math.max(1e-6, max - min)) *
          (h - padTop - padBottom);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const labels = [
    {
      val: max,
      label: `$${getRealPrice(max).toFixed(2)}`,
    },
    {
      val: min,
      label: `$${getRealPrice(min).toFixed(2)}`,
    },
  ];

  return (
    <div className="relative">
      <svg
        width={w}
        height={h}
        className="w-full"
      >
        <defs>
          <linearGradient
            id="gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={
                isUp
                  ? "#10b981"
                  : "#ef4444"
              }
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={
                isUp
                  ? "#10b981"
                  : "#ef4444"
              }
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path
          d={`${d} L ${w - padRight} ${h - padBottom} L 0 ${h - padBottom} Z`}
          fill="url(#gradient)"
        />

        {/* Line */}
        <path
          d={d}
          fill="none"
          stroke={
            isUp ? "#10b981" : "#ef4444"
          }
          strokeWidth="2"
        />

        {/* Labels */}
        {labels.map((label, i) => (
          <text
            key={i}
            x={w - padRight + 5}
            y={
              h -
              padBottom -
              ((label.val - min) /
                Math.max(
                  1e-6,
                  max - min
                )) *
                (h - padTop - padBottom)
            }
            fill="currentColor"
            fontSize="10"
            className="text-muted-foreground"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

interface ExchangeDetailPageProps {
  token: MarketToken;
  orderBook: MarketOrderBook;
  series: MarketSeries;
  positions: Position[];
  onFavorite: (tokenId: string) => void;
  isFavorite: boolean;
}

export default function ExchangeDetailPage({
  token,
  orderBook,
  series,
  positions,
  onFavorite,
  isFavorite,
}: ExchangeDetailPageProps) {
  const router = useRouter();
  const [orderType, setOrderType] =
    useState<"buy" | "sell">("buy");
  const [orderAmount, setOrderAmount] =
    useState("");
  const [orderPrice, setOrderPrice] =
    useState(token.priceUsd.toString());
  const [activeTab, setActiveTab] =
    useState("chart");

  // Prepare chart data (not used directly, but kept for reference)
  const chartData = useMemo(() => {
    return series.series.map(
      (value, index) => ({
        time: index,
        value: value,
      })
    );
  }, [series]); // eslint-disable-line @typescript-eslint/no-unused-vars

  // Calculate order total
  const orderTotal = useMemo(() => {
    const amount =
      parseFloat(orderAmount) || 0;
    const price =
      parseFloat(orderPrice) || 0;
    return amount * price;
  }, [orderAmount, orderPrice]);

  const handlePlaceOrder = () => {
    // Implement order placement logic
    console.log("Placing order:", {
      type: orderType,
      amount: orderAmount,
      price: orderPrice,
      total: orderTotal,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.back()
            }
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {token.symbol}
              </h1>
              <Badge
                variant="outline"
                className="text-xs"
              >
                {token.projectTitle}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ${token.priceUsd}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  token.change24hPct >=
                    0
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {token.change24hPct >= 0
                  ? "+"
                  : ""}
                {token.change24hPct.toFixed(
                  2
                )}
                %
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onFavorite(token.id)
            }
          >
            {isFavorite ? (
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="chart"
              className="text-xs font-bold uppercase tracking-wider"
            >
              Gráfico
            </TabsTrigger>
            <TabsTrigger
              value="orderbook"
              className="text-xs font-bold uppercase tracking-wider"
            >
              Libro
            </TabsTrigger>
            <TabsTrigger
              value="positions"
              className="text-xs font-bold uppercase tracking-wider"
            >
              Órdenes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab}>
          <TabsContent
            value="chart"
            className="mt-0 space-y-4 p-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Precio en USD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  series={series.series}
                  isUp={
                    token.change24hPct >=
                    0
                  }
                  currentPrice={
                    token.priceUsd
                  }
                />
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    24h
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        token.change24hPct >=
                          0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {token.change24hPct >=
                      0
                        ? "+"
                        : ""}
                      {token.change24hPct.toFixed(
                        2
                      )}
                      %
                    </span>
                    {token.change24hPct >=
                    0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    7d
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        token.change7dPct >=
                          0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {token.change7dPct >=
                      0
                        ? "+"
                        : ""}
                      {token.change7dPct.toFixed(
                        2
                      )}
                      %
                    </span>
                    {token.change7dPct >=
                    0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="orderbook"
            className="mt-0 space-y-4 p-4"
          >
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Compras
                </h3>
                <div className="space-y-1">
                  {orderBook.bids
                    .slice(0, 10)
                    .map(
                      (bid, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-green-500">
                            ${bid.price}
                          </span>
                          <span>
                            {bid.amount}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Ventas
                </h3>
                <div className="space-y-1">
                  {orderBook.asks
                    .slice(0, 10)
                    .map(
                      (ask, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-red-500">
                            ${ask.price}
                          </span>
                          <span>
                            {ask.amount}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="positions"
            className="mt-0 space-y-3 p-4"
          >
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay órdenes activas
              </div>
            ) : (
              positions.map(
                (position) => (
                  <Card
                    key={position.id}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">
                            {position.side ===
                            "BUY"
                              ? "Compra"
                              : "Venta"}{" "}
                            {
                              position.tokenSymbol
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {
                              position.filledAmount
                            }
                            /
                            {
                              position.totalAmount
                            }{" "}
                            tokens
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {
                            position.status
                          }
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span>
                          Precio: $
                          {
                            position.orderPriceUsd
                          }
                        </span>
                        <span>
                          Total: $
                          {position.orderPriceUsd *
                            position.filledAmount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Form */}
      <div className="border-t p-4 space-y-4 bg-card">
        <div className="flex gap-2">
          <Button
            variant={
              orderType === "buy"
                ? "default"
                : "outline"
            }
            className="flex-1"
            onClick={() =>
              setOrderType("buy")
            }
          >
            Comprar
          </Button>
          <Button
            variant={
              orderType === "sell"
                ? "default"
                : "outline"
            }
            className="flex-1"
            onClick={() =>
              setOrderType("sell")
            }
          >
            Vender
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Cantidad</Label>
            <Input
              placeholder="0.00"
              value={orderAmount}
              onChange={(e) =>
                setOrderAmount(
                  e.target.value
                )
              }
              type="number"
            />
          </div>
          <div>
            <Label>
              Precio por token
            </Label>
            <Input
              placeholder="0.00"
              value={orderPrice}
              onChange={(e) =>
                setOrderPrice(
                  e.target.value
                )
              }
              type="number"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span className="font-semibold">
              ${orderTotal.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full"
            variant={
              orderType === "buy"
                ? "default"
                : "destructive"
            }
            onClick={handlePlaceOrder}
            disabled={
              !orderAmount ||
              !orderPrice
            }
          >
            {orderType === "buy"
              ? "Comprar"
              : "Vender"}{" "}
            {token.symbol}
          </Button>
        </div>
      </div>
    </div>
  );
}
