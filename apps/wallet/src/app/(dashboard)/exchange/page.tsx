"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowLeft,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Star,
  Settings2,
  LayoutGrid,
  List,
  Clock,
  CircleDollarSign,
  ChevronDown,
  Filter,
  Info,
  Layers,
  MapPin,
  X,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Label } from "@repo/ui/components/ui/label";

interface TokenData {
  id: string;
  unitId?: string;
  name: string;
  project: string;
  price: number;
  marketCap: string;
  change24h: number;
  change7d: number;
  change30d: number;
  changeAll: number;
  liveSince: string;
  isFavorite: boolean;
  tokensAvailable?: string;
  roi?: string;
  buyPrice?: number;
  sellPrice?: number;
}

interface PositionData {
  id: string;
  tokenName: string;
  totalAmount: number;
  filledAmount: number;
  orderPrice: number;
  marketPrice: number;
  logoColor: string;
}

const INITIAL_TOKENS: TokenData[] = [
  {
    id: "1",
    unitId: "522",
    name: "VEX-ALAMOS-B3-522",
    project: "Los Álamos T1",
    price: 1.25,
    marketCap: "520K",
    change24h: 0.5,
    change7d: 2.1,
    change30d: 5.4,
    changeAll: 12.4,
    liveSince: "6 meses",
    isFavorite: true,
    tokensAvailable: "1,250",
    roi: "12.4",
    buyPrice: 1.25,
    sellPrice: 1.24,
  },
  {
    id: "2",
    unitId: "105",
    name: "VEX-HORIZON-T2-105",
    project: "Horizonte T2",
    price: 0.98,
    marketCap: "840K",
    change24h: -0.2,
    change7d: -1.5,
    change30d: -0.5,
    changeAll: 4.2,
    liveSince: "3 meses",
    isFavorite: false,
    tokensAvailable: "840",
    roi: "8.2",
    buyPrice: 0.98,
    sellPrice: undefined,
  },
  {
    id: "3",
    unitId: "302",
    name: "VEX-VIVERO-A1-302",
    project: "Vivero BSAS",
    price: 2.1,
    marketCap: "1.2M",
    change24h: 1.2,
    change7d: 3.5,
    change30d: 1.2,
    changeAll: 8.9,
    liveSince: "1 año",
    isFavorite: false,
    tokensAvailable: "600",
    roi: "15.0",
    buyPrice: undefined,
    sellPrice: 2.08,
  },
  {
    id: "4",
    unitId: "211",
    name: "VEX-CASA-L4-211",
    project: "Casas Lomas",
    price: 1.05,
    marketCap: "310K",
    change24h: -0.1,
    change7d: 0.8,
    change30d: 2.2,
    changeAll: 5.1,
    liveSince: "2 meses",
    isFavorite: true,
    tokensAvailable: "1,100",
    roi: "10.5",
    buyPrice: undefined,
    sellPrice: undefined,
  },
];

const INITIAL_POSITIONS: PositionData[] =
  [
    {
      id: "1",
      tokenName: "VEX-ALAMOS-B3-522",
      totalAmount: 1000,
      filledAmount: 450,
      orderPrice: 1.22,
      marketPrice: 1.25,
      logoColor:
        "from-blue-500 to-blue-600",
    },
    {
      id: "2",
      tokenName: "VEX-HORIZON-T2-105",
      totalAmount: 500,
      filledAmount: 500,
      orderPrice: 0.97,
      marketPrice: 0.98,
      logoColor:
        "from-emerald-500 to-emerald-600",
    },
    {
      id: "3",
      tokenName: "VEX-VIVERO-A1-302",
      totalAmount: 200,
      filledAmount: 0,
      orderPrice: 2.08,
      marketPrice: 2.1,
      logoColor:
        "from-purple-500 to-purple-600",
    },
  ];

export default function ExchangePage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<
    TokenData[]
  >(INITIAL_TOKENS);
  const [positions, setPositions] =
    useState<PositionData[]>(
      INITIAL_POSITIONS
    );
  const [search, setSearch] =
    useState("");
  const [sortBy, setSortBy] = useState<
    "marketCap" | "change"
  >("marketCap");
  const [timeframe, setTimeframe] =
    useState<
      "24h" | "7d" | "30d" | "all"
    >("all");
  const [
    selectedTokenId,
    setSelectedTokenId,
  ] = useState<string | null>(null);

  const toggleFavorite = (
    id: string
  ) => {
    setTokens(
      tokens.map((t) =>
        t.id === id
          ? {
              ...t,
              isFavorite: !t.isFavorite,
            }
          : t
      )
    );
  };

  const selectedToken = tokens.find(
    (t) => t.id === selectedTokenId
  );

  const filteredTokens = tokens
    .filter(
      (t) =>
        t.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        t.project
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )
    .sort((a, b) => {
      if (sortBy === "marketCap") {
        const valA = parseFloat(
          a.marketCap
            .replace("K", "")
            .replace("M", "000")
        );
        const valB = parseFloat(
          b.marketCap
            .replace("K", "")
            .replace("M", "000")
        );
        return valB - valA;
      } else {
        const getChange = (
          t: TokenData
        ) => {
          if (timeframe === "24h")
            return t.change24h;
          if (timeframe === "7d")
            return t.change7d;
          if (timeframe === "30d")
            return t.change30d;
          return t.changeAll;
        };
        return (
          getChange(b) - getChange(a)
        );
      }
    });

  const favorites = tokens.filter(
    (t) => t.isFavorite
  );

  const TokenRow = ({
    token,
  }: {
    token: TokenData;
  }) => (
    <div
      key={token.id}
      onClick={() =>
        setSelectedTokenId(token.id)
      }
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
            {token.unitId || token.id}
          </div>
          <div className="min-w-0">
            <div className="font-black text-[14px] uppercase text-[#3B2146] leading-tight truncate">
              {token.name}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5 truncate">
              {token.project}
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center shrink-0">
          {(token.buyPrice ||
            token.sellPrice) && (
            <div className="flex flex-col gap-1 items-end">
              {token.sellPrice && (
                <Badge className="bg-brand-pink/10 text-brand-pink border-brand-pink/20 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border h-auto">
                  $
                  {token.sellPrice.toFixed(
                    2
                  )}
                </Badge>
              )}
              {token.buyPrice && (
                <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border h-auto">
                  $
                  {token.buyPrice.toFixed(
                    2
                  )}
                </Badge>
              )}
            </div>
          )}

          <div className="text-right">
            <div className="text-[16px] font-black text-[#3B2146] leading-tight">
              ${token.price.toFixed(2)}
            </div>
            <div
              className={`text-[10px] font-black uppercase mt-0.5 flex items-center justify-end ${token.changeAll >= 0 ? "text-brand-green" : "text-brand-pink"}`}
            >
              {token.changeAll >= 0
                ? "+"
                : ""}
              {token.changeAll}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col pb-48 min-h-screen bg-background">
      {/* Premium Header from Units Page */}
      <header className="sticky top-0 z-50 bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white px-4 py-5 rounded-b-[40px] shadow-xl border-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10"></div>

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

      <div className="flex flex-col flex-1">
        <Tabs
          defaultValue="market"
          className="w-full"
        >
          {/* Custom Tabs List modernized for Mobile (Adjusts to width, larger touch targets) */}
          <div className="px-4 py-4 border-b border-border/50 bg-muted/10">
            <TabsList className="flex items-center gap-1.5 w-full h-auto bg-transparent p-0 border-none">
              <TabsTrigger
                value="market"
                className="flex-1 min-w-0 h-11 px-2 rounded-2xl bg-secondary/50 border border-border/50 text-[9px] font-black uppercase tracking-wider text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:border-primary/20 data-[state=active]:text-primary"
              >
                Mercado
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex-1 min-w-0 h-11 px-2 rounded-2xl bg-secondary/50 border border-border/50 text-[9px] font-black uppercase tracking-wider text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:border-primary/20 data-[state=active]:text-primary"
              >
                Favoritos
              </TabsTrigger>
              <TabsTrigger
                value="positions"
                className="flex-1 min-w-0 h-11 px-2 rounded-2xl bg-secondary/50 border border-border/50 text-[9px] font-black uppercase tracking-wider text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:border-primary/20 data-[state=active]:text-primary"
              >
                Mis Posiciones
              </TabsTrigger>
              <button className="flex justify-center items-center w-11 h-11 rounded-2xl border shrink-0 bg-secondary/30 text-muted-foreground border-border/30">
                <Filter className="w-4 h-4" />
              </button>
            </TabsList>
          </div>

          <TabsContent
            value="market"
            className="p-4 space-y-4"
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
                    "rounded-2xl gap-1 flex-1 h-11 transition-all text-[10px] uppercase font-black tracking-wider border border-white/5",
                    sortBy ===
                      "marketCap"
                      ? "shadow-md bg-primary text-primary-foreground"
                      : "bg-white/5"
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
                    sortBy === "change"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "rounded-2xl gap-1 flex-1 h-11 transition-all text-[10px] uppercase font-black tracking-wider border border-white/5",
                    sortBy === "change"
                      ? "shadow-md bg-primary text-primary-foreground"
                      : "bg-white/5"
                  )}
                  onClick={() =>
                    setSortBy("change")
                  }
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="truncate">
                    % Var.
                  </span>
                </Button>

                <div className="flex gap-1 items-center p-1 h-11 rounded-2xl border bg-muted/20 border-border/30">
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
                        "rounded-xl px-2 h-full text-[9px] font-black tracking-tighter transition-all border-none",
                        timeframe ===
                          tf.toLowerCase()
                          ? "shadow-sm bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-white/5"
                      )}
                      onClick={() =>
                        setTimeframe(
                          tf.toLowerCase() as
                            | "24h"
                            | "7d"
                            | "30d"
                            | "all"
                        )
                      }
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredTokens.length >
              0 ? (
                filteredTokens.map(
                  (token) => (
                    <TokenRow
                      key={token.id}
                      token={token}
                    />
                  )
                )
              ) : (
                <div className="py-20 text-center rounded-3xl border border-dashed text-muted-foreground bg-muted/5 border-muted/20">
                  <Search className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">
                    No se encontraron
                    tokens
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="favorites"
            className="p-4 space-y-4"
          >
            <div className="grid gap-4">
              {favorites.length > 0 ? (
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
                  <Star className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">
                    No tienes favoritos
                    aún
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="positions"
            className="p-4 space-y-4"
          >
            <Card className="bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-primary/10 overflow-hidden relative shadow-lg rounded-[28px] mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />{" "}
                  Patrimoninio Estimado
                </CardTitle>
                <div className="text-3xl font-black tracking-tighter text-foreground">
                  $4,250.00
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] font-black flex items-center text-brand-green bg-brand-green/10 w-fit px-2.5 py-1 rounded-full border border-brand-green/20">
                  <TrendingUp className="mr-1 w-3 h-3" />{" "}
                  +$245.00 (5.8%) hoy
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {positions
                .sort(
                  (a, b) =>
                    Math.abs(
                      a.orderPrice -
                        a.marketPrice
                    ) -
                    Math.abs(
                      b.orderPrice -
                        b.marketPrice
                    )
                )
                .map((pos) => {
                  const expectedGain =
                    (pos.marketPrice -
                      pos.orderPrice) *
                    pos.totalAmount;
                  const marketValue =
                    pos.filledAmount *
                    pos.marketPrice;
                  const progress =
                    (pos.filledAmount /
                      pos.totalAmount) *
                    100;

                  return (
                    <Card
                      key={pos.id}
                      className="border-muted/20 overflow-hidden shadow-md rounded-[28px] bg-card"
                    >
                      <CardContent className="p-0">
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-center">
                              <div
                                className={cn(
                                  "h-12 w-12 rounded-2xl bg-linear-to-br flex items-center justify-center text-white shadow-lg",
                                  pos.logoColor
                                )}
                              >
                                <Layers className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-base font-black tracking-tight">
                                  {
                                    pos.tokenName
                                  }
                                </h4>
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                    {
                                      pos.filledAmount
                                    }{" "}
                                    /{" "}
                                    {
                                      pos.totalAmount
                                    }{" "}
                                    TOKENS
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-none"
                                  >
                                    {Math.round(
                                      progress
                                    )}
                                    %
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                Valor
                                Actual
                              </div>
                              <div className="text-xl font-black tracking-tighter text-foreground">
                                $
                                {marketValue.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-2xl border backdrop-blur-sm bg-background/40 border-border/50">
                              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 opacity-60">
                                Tu Orden
                              </div>
                              <div className="text-sm font-black">
                                $
                                {pos.orderPrice.toFixed(
                                  2
                                )}
                              </div>
                            </div>
                            <div className="p-3 rounded-2xl border backdrop-blur-sm bg-background/40 border-border/50">
                              <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 opacity-60">
                                Mercado
                              </div>
                              <div className="text-sm font-black">
                                $
                                {pos.marketPrice.toFixed(
                                  2
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="pt-1 space-y-3">
                            <div className="flex justify-between items-end">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                  Ganancia
                                  Esperada
                                </span>
                                <span className="text-xs font-black text-brand-green">
                                  +
                                  {expectedGain >
                                  0
                                    ? "$"
                                    : "-$"}
                                  {Math.abs(
                                    expectedGain
                                  ).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                              <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                                Progresión
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-0">
                              <div
                                className="h-full transition-all duration-1000 ease-out bg-primary"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Token Quick Action Panel - Shows OVER Bottom Nav as requested */}
      {selectedToken && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-300">
          <div className="bg-card/95 backdrop-blur-3xl border border-primary/30 shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.4)] rounded-[32px] p-6 overflow-hidden relative">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                setSelectedTokenId(null)
              }
              className="absolute top-6 right-6 z-50 w-9 h-9 bg-white rounded-full border-none shadow-lg hover:bg-white/90 text-slate-500"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                      {
                        selectedToken.name
                      }
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-foreground">
                    {
                      selectedToken.project
                    }
                  </h3>
                  <div className="flex flex-col gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span className="flex gap-1.5 items-center">
                      <MapPin className="w-3.5 h-3.5" />{" "}
                      Nuñez, BA
                    </span>
                    <span className="flex gap-1.5 items-center">
                      <Layers className="w-3.5 h-3.5" />{" "}
                      ROI Est:{" "}
                      {
                        selectedToken.roi
                      }
                      %
                    </span>
                  </div>
                </div>
                <div className="pr-10 text-right">
                  <div className="text-2xl font-black text-foreground">
                    $
                    {selectedToken.price.toFixed(
                      2
                    )}
                  </div>
                  <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                    Stock:{" "}
                    {
                      selectedToken.tokensAvailable
                    }{" "}
                    Tokens
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-[10px] font-black tracking-widest uppercase rounded-xl border-border hover:bg-muted/50 hover:text-foreground"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.name
                      );
                    const returnTo =
                      encodeURIComponent(
                        `/exchange/${symbol}`
                      );
                    router.push(
                      `/project/1?returnTo=${returnTo}`
                    );
                  }}
                >
                  PROYECTO
                </Button>
                <Button
                  disabled={
                    !positions.some(
                      (p) =>
                        p.tokenName ===
                          selectedToken.name &&
                        p.filledAmount >
                          0
                    )
                  }
                  className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:scale-100"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.name
                      );
                    router.push(
                      `/exchange/${symbol}`
                    );
                  }}
                >
                  VENDER
                </Button>
                <Button
                  className="flex-[1.5] h-14 rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px]"
                  onClick={() => {
                    const symbol =
                      encodeURIComponent(
                        selectedToken.name
                      );
                    router.push(
                      `/exchange/${symbol}`
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
