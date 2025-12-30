"use client";

import {
  useMemo,
  useState,
  useEffect,
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

async function fetchWalletBalances(): Promise<
  WalletBalance[]
> {
  const response = await fetch(
    "/api/wallet/balances"
  );
  if (!response.ok)
    throw new Error(
      "Failed to fetch balances"
    );
  const json = (await response
    .json()
    .catch(() => null)) as
    | { balances?: WalletBalance[] }
    | null;
  return Array.isArray(json?.balances)
    ? json.balances
    : [];
}

export default function ExchangeBuyPageClient({
  symbol,
}: {
  symbol: string;
}) {
  const router = useRouter();
  const [token, setToken] =
    useState<MarketToken | null>(null);
  const [balances, setBalances] =
    useState<WalletBalance[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState<
    string | null
  >(null);
  const [
    marketAmount,
    setMarketAmount,
  ] = useState<string>("");
  const [orderAmount, setOrderAmount] =
    useState<string>("");
  const [orderPrice, setOrderPrice] =
    useState<string>("");
  const [orderType, setOrderType] =
    useState<"market" | "limit">(
      "market"
    );

  // Fetch data on mount and when symbol changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          tokenData,
          balancesData,
        ] = await Promise.all([
          fetchMarketTokenBySymbol(
            symbol
          ),
          fetchWalletBalances(),
        ]);

        if (!tokenData) {
          setError("Token not found");
          return;
        }

        setToken(tokenData);
        setBalances(balancesData);
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

  const usdtBalance = useMemo(() => {
    return (
      balances.find(
        (b) => b.currencyCode === "USDT"
      ) ?? {
        currencyCode: "USDT",
        available: 0,
        locked: 0,
      }
    );
  }, [balances]);

  const maxBuyAmount = useMemo(() => {
    if (!token) return 0;
    return Math.floor(
      usdtBalance.available /
        token.priceUsd
    );
  }, [usdtBalance, token]);

  const handleMarketAmountChange = (
    value: string
  ) => {
    setMarketAmount(value);
    const amount = parseAmount(value);
    const total =
      amount * (token?.priceUsd || 0);
    setOrderAmount(
      total > 0 ? total.toFixed(2) : ""
    );
  };

  const handleOrderAmountChange = (
    value: string
  ) => {
    setOrderAmount(value);
    const amount = parseAmount(value);
    const tokens =
      amount > 0 && token
        ? (
            amount / token.priceUsd
          ).toFixed(2)
        : "";
    setMarketAmount(tokens);
  };

  const handleMarketAmountPercent = (
    percent: number
  ) => {
    const amount = Math.floor(
      maxBuyAmount * percent
    );
    handleMarketAmountChange(
      amount.toString()
    );
  };

  const handleOrderAmountPercent = (
    percent: number
  ) => {
    const amount =
      usdtBalance.available * percent;
    handleOrderAmountChange(
      amount.toFixed(2)
    );
  };

  const handleSubmit = () => {
    // Placeholder for order submission
    console.log(
      "Buy order submitted:",
      {
        type: orderType,
        amount:
          orderType === "market"
            ? marketAmount
            : orderAmount,
        price:
          orderType === "limit"
            ? orderPrice
            : token?.priceUsd,
        token: token?.symbol,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">
          Loading buy page data...
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
        <div className="flex gap-4 items-center p-4">
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
              Buy {token.symbol}
            </h1>
            <p className="text-sm text-muted-foreground">
              {token.projectTitle}
            </p>
          </div>
        </div>
      </header>

      {/* Balance */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Available Balance
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  $
                  {usdtBalance.available.toFixed(
                    2
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {
                    usdtBalance.currencyCode
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Form */}
      <div className="flex-1 px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <Tabs
              value={orderType}
              onValueChange={(value) =>
                setOrderType(
                  value as
                    | "market"
                    | "limit"
                )
              }
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="market">
                  Market Order
                </TabsTrigger>
                <TabsTrigger value="limit">
                  Limit Order
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="market"
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <Label>
                    Amount (
                    {token.symbol})
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={marketAmount}
                    onChange={(e) =>
                      handleMarketAmountChange(
                        e.target.value
                      )
                    }
                  />
                  <div className="flex gap-2">
                    {[
                      0.25, 0.5, 0.75,
                      1,
                    ].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleMarketAmountPercent(
                            percent
                          )
                        }
                      >
                        {percent * 100}%
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Total (USDT)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={orderAmount}
                    onChange={(e) =>
                      handleOrderAmountChange(
                        e.target.value
                      )
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="limit"
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <Label>
                    Price (USDT)
                  </Label>
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
                <div className="space-y-2">
                  <Label>
                    Amount (
                    {token.symbol})
                  </Label>
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
                <div className="flex gap-2">
                  {[
                    0.25, 0.5, 0.75, 1,
                  ].map((percent) => (
                    <Button
                      key={percent}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleOrderAmountPercent(
                          percent
                        )
                      }
                    >
                      {percent * 100}%
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Current Price
                </span>
                <span>
                  $
                  {token.priceUsd.toFixed(
                    2
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Max Buy Amount
                </span>
                <span>
                  {maxBuyAmount}{" "}
                  {token.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>
                  $
                  {parseAmount(
                    orderAmount
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={handleSubmit}
            >
              Buy {token.symbol}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
