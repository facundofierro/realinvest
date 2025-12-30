"use client";

import {
  useState,
  useMemo,
  useEffect,
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
        {labels.map((l, i) => (
          <text
            key={i}
            x={w - padRight + 5}
            y={
              h -
              padBottom -
              ((l.val - min) /
                Math.max(
                  1e-6,
                  max - min
                )) *
                (h - padTop - padBottom)
            }
            fontSize="10"
            fill="#9ca3af"
            dominantBaseline="middle"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// API functions to fetch data client-side
async function fetchMarketTokenBySymbol(
  symbol: string
): Promise<MarketToken | null> {
  const response = await fetch(
    `/api/market/tokens?symbol=${symbol}`
  );
  if (!response.ok) return null;
  const json = (await response
    .json()
    .catch(() => null)) as
    | { tokens?: MarketToken[] }
    | null;
  const tokens = Array.isArray(json?.tokens)
    ? json.tokens
    : [];
  return (
    tokens.find(
      (t: MarketToken) =>
        t.symbol === symbol
    ) || null
  );
}

async function fetchMarketOrderBook(
  symbol: string
): Promise<MarketOrderBook> {
  const response = await fetch(
    `/api/market/orderbook?symbol=${symbol}`
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch order book"
    );
  return response.json();
}

async function fetchMarketSeries(
  symbol: string,
  interval: string,
  limit: number
): Promise<MarketSeries> {
  const response = await fetch(
    `/api/market/series?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch series"
    );
  return response.json();
}

async function fetchWalletPositions(): Promise<
  Position[]
> {
  const response = await fetch(
    "/api/wallet/positions"
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch positions"
    );
  const json = (await response
    .json()
    .catch(() => null)) as
    | { positions?: Position[] }
    | null;
  return Array.isArray(json?.positions)
    ? json.positions
    : [];
}

export default function ExchangeDetailPageClient({
  symbol,
}: {
  symbol: string;
}) {
  const router = useRouter();
  const [token, setToken] =
    useState<MarketToken | null>(null);
  const [orderBook, setOrderBook] =
    useState<MarketOrderBook>({
      bids: [],
      asks: [],
    });
  const [series, setSeries] =
    useState<MarketSeries>({
      series: [],
    });
  const [positions, setPositions] =
    useState<Position[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState<
    string | null
  >(null);
  const [isFavorite, setIsFavorite] =
    useState(false);
  const [orderType, setOrderType] =
    useState<"buy" | "sell">("buy");
  const [orderAmount, setOrderAmount] =
    useState("");
  const [orderPrice, setOrderPrice] =
    useState("");

  // Fetch data on mount and when symbol changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          tokenData,
          orderBookData,
          seriesData,
          positionsData,
        ] = await Promise.all([
          fetchMarketTokenBySymbol(
            symbol
          ),
          fetchMarketOrderBook(symbol),
          fetchMarketSeries(
            symbol,
            "24h",
            100
          ),
          fetchWalletPositions(),
        ]);

        if (!tokenData) {
          setError("Token not found");
          return;
        }

        setToken(tokenData);
        setOrderBook(orderBookData);
        setSeries(seriesData);
        setPositions(positionsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol]);

  const handleFavorite = (
    tokenId: string
  ) => {
    setIsFavorite(!isFavorite);
  };

  const chartSeries = useMemo(() => {
    if (
      !series ||
      series.series.length === 0
    )
      return [];
    return series.series;
  }, [series]);

  const isUp = useMemo(() => {
    if (chartSeries.length < 2)
      return true;
    return (
      chartSeries[
        chartSeries.length - 1
      ] > chartSeries[0]
    );
  }, [chartSeries]);

  const spread = useMemo(() => {
    if (
      !orderBook.asks.length ||
      !orderBook.bids.length
    )
      return 0;
    return (
      orderBook.asks[0].price -
      orderBook.bids[0].price
    );
  }, [orderBook]);

  const handleOrderSubmit = () => {
    // Placeholder for order submission
    console.log("Order submitted:", {
      type: orderType,
      amount: orderAmount,
      price: orderPrice,
      token: token?.symbol,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">
          Loading token data...
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-destructive">
          Error:{" "}
          {error || "Token not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.back()
              }
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {token.symbol}
              </h1>
              <p className="text-sm text-muted-foreground">
                {token.projectTitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleFavorite(token.id)
            }
          >
            {isFavorite ? (
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Price Chart */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-2xl font-bold">
                  $
                  {token.priceUsd.toFixed(
                    2
                  )}
                </div>
                <div
                  className={cn(
                    "flex gap-1 items-center text-sm",
                    isUp
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {isUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  2.5%
                </div>
              </div>
              <div className="text-sm text-right text-muted-foreground">
                <div>Market Cap</div>
                <div>
                  $
                  {(
                    token.marketCapUsd /
                    1e6
                  ).toFixed(1)}
                  M
                </div>
              </div>
            </div>
            {chartSeries.length > 0 && (
              <LineChart
                series={chartSeries}
                isUp={isUp}
                currentPrice={
                  token.priceUsd
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Form */}
      <div className="px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={
                    orderType === "buy"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setOrderType("buy")
                  }
                >
                  Buy
                </Button>
                <Button
                  variant={
                    orderType === "sell"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setOrderType("sell")
                  }
                >
                  Sell
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={orderAmount}
                  onChange={(e) =>
                    setOrderAmount(
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={orderPrice}
                  onChange={(e) =>
                    setOrderPrice(
                      e.target.value
                    )
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={
                  handleOrderSubmit
                }
              >
                Place{" "}
                {orderType === "buy"
                  ? "Buy"
                  : "Sell"}{" "}
                Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Book */}
      <div className="px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Order Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Spread: $
                  {spread.toFixed(2)}
                </span>
                <span>
                  Volume: 1.2M
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="mb-2 font-semibold text-green-600">
                    Bids
                  </div>
                  {orderBook.bids
                    .slice(0, 5)
                    .map((bid, i) => (
                      <div
                        key={i}
                        className="flex justify-between"
                      >
                        <span>
                          {bid.price.toFixed(
                            2
                          )}
                        </span>
                        <span>
                          {bid.amount}
                        </span>
                      </div>
                    ))}
                </div>
                <div>
                  <div className="mb-2 font-semibold text-red-600">
                    Asks
                  </div>
                  {orderBook.asks
                    .slice(0, 5)
                    .map((ask, i) => (
                      <div
                        key={i}
                        className="flex justify-between"
                      >
                        <span>
                          {ask.price.toFixed(
                            2
                          )}
                        </span>
                        <span>
                          {ask.amount}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
