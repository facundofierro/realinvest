"use client";

import { useState } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { 
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
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
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
    roi: "12.4"
  },
  { 
    id: "2", 
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
    roi: "8.2"
  },
  { 
    id: "3", 
    name: "VEX-VIVERO-A1-302", 
    project: "Vivero BSAS", 
    price: 2.10, 
    marketCap: "1.2M", 
    change24h: 1.2,
    change7d: 3.5,
    change30d: 1.2, 
    changeAll: 8.9, 
    liveSince: "1 año",
    isFavorite: false,
    tokensAvailable: "600",
    roi: "15.0"
  },
  { 
    id: "4", 
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
    roi: "10.5"
  },
];

const INITIAL_POSITIONS: PositionData[] = [
    {
        id: "1",
        tokenName: "VEX-ALAMOS-B3-522",
        totalAmount: 1000,
        filledAmount: 450,
        orderPrice: 1.22,
        marketPrice: 1.25,
        logoColor: "from-blue-500 to-blue-600"
    },
    {
        id: "2",
        tokenName: "VEX-HORIZON-T2-105",
        totalAmount: 500,
        filledAmount: 500,
        orderPrice: 0.97,
        marketPrice: 0.98,
        logoColor: "from-emerald-500 to-emerald-600"
    },
    {
        id: "3",
        tokenName: "VEX-VIVERO-A1-302",
        totalAmount: 200,
        filledAmount: 0,
        orderPrice: 2.08,
        marketPrice: 2.10,
        logoColor: "from-purple-500 to-purple-600"
    }
];

export default function ExchangePage() {
  const [tokens, setTokens] = useState<TokenData[]>(INITIAL_TOKENS);
  const [positions, setPositions] = useState<PositionData[]>(INITIAL_POSITIONS);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"marketCap" | "change">("marketCap");
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">("all");
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.project.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "marketCap") {
      const valA = parseFloat(a.marketCap.replace('K', '').replace('M', '000'));
      const valB = parseFloat(b.marketCap.replace('K', '').replace('M', '000'));
      return valB - valA;
    } else {
      const getChange = (t: TokenData) => {
        if (timeframe === "24h") return t.change24h;
        if (timeframe === "7d") return t.change7d;
        if (timeframe === "30d") return t.change30d;
        return t.changeAll;
      };
      return getChange(b) - getChange(a);
    }
  });

  const favorites = tokens.filter(t => t.isFavorite);

  const TokenRow = ({ token }: { token: TokenData }) => (
    <Card 
        key={token.id} 
        onClick={() => setSelectedTokenId(token.id)}
        className={cn(
            "hover:bg-muted/30 transition-all cursor-pointer border-muted/20 overflow-hidden",
            selectedTokenId === token.id ? "ring-2 ring-primary border-transparent" : ""
        )}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 -ml-2 shrink-0 ${token.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground'}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(token.id);
            }}
          >
            <Star className={`h-4 w-4 ${token.isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <div className="space-y-1 min-w-0">
            <div className="font-bold flex items-center gap-2">
              <span className="truncate text-sm">{token.name}</span>
              <Badge variant="outline" className="font-normal text-[9px] py-0 h-4 border-muted/50 bg-muted/50 px-1">
                {token.liveSince}
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{token.project}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right flex items-center gap-4">
            <div className="w-20">
              <div className="font-bold text-base leading-tight">${token.price.toFixed(2)}</div>
              <div className={`text-xs flex items-center justify-end font-bold ${token.changeAll >= 0 ? 'text-brand-green' : 'text-brand-pink'}`}>
                {token.changeAll >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {token.changeAll > 0 ? '+' : ''}{token.changeAll}%
              </div>
              <div className="text-[8px] text-muted-foreground uppercase font-medium">All Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-4 min-h-screen pb-48 bg-background/50">
      {/* Header removed as requested, keeping only essential Tabs */}
      
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-3 p-1.5 bg-muted/20 backdrop-blur-xl rounded-2xl h-14 border border-white/5">
          <TabsTrigger value="market" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-xs uppercase tracking-wider">Mercado</TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-xs uppercase tracking-wider">Favoritos</TabsTrigger>
          <TabsTrigger value="positions" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-xs uppercase tracking-wider">Mis Posiciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market" className="space-y-4 pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Button 
                variant={sortBy === "marketCap" ? "secondary" : "ghost"} 
                size="sm" 
                className={cn(
                    "rounded-full gap-1 shrink-0 h-9 transition-all text-xs border border-white/5",
                    sortBy === "marketCap" ? "shadow-md bg-primary text-primary-foreground font-bold" : "bg-white/5"
                )}
                onClick={() => setSortBy("marketCap")}
              >
                <CircleDollarSign className="h-4 w-4" />
                Marketcap
              </Button>
              <Button 
                variant={sortBy === "change" ? "secondary" : "ghost"} 
                size="sm" 
                className={cn(
                    "rounded-full gap-1 shrink-0 h-9 transition-all text-xs border border-white/5",
                    sortBy === "change" ? "shadow-md bg-primary text-primary-foreground font-bold" : "bg-white/5"
                )}
                onClick={() => setSortBy("change")}
              >
                <TrendingUp className="h-4 w-4" />
                % Variación
              </Button>
              <div className="h-4 w-px bg-muted/30 mx-1 shrink-0" />
              <div className="flex gap-1">
                {(["24h", "7d", "30d", "all"] as const).map((tf) => (
                  <Button 
                    key={tf}
                    variant={timeframe === tf ? "secondary" : "ghost"} 
                    size="sm" 
                    className={cn(
                        "rounded-full px-3 h-9 text-[10px] uppercase font-bold tracking-wider transition-all border border-white/5",
                        timeframe === tf ? "shadow-md bg-primary text-primary-foreground" : "bg-white/5"
                    )}
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <TokenRow key={token.id} token={token} />
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground bg-muted/5 rounded-3xl border border-dashed border-muted/20">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">No se encontraron tokens</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other tabs content remains mostly same but styled */}
        <TabsContent value="favorites" className="space-y-4 pt-4">
          <div className="grid gap-3">
            {favorites.length > 0 ? (
              favorites.map((token) => (
                <TokenRow key={token.id} token={token} />
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground bg-muted/5 rounded-3xl border border-dashed border-muted/20">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">No tienes favoritos aún</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4 pt-4">
          <Card className="bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-primary/10 overflow-hidden relative shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Patrimoninio Estimado
              </CardTitle>
              <div className="text-3xl font-black tracking-tighter text-foreground">$4,250.00</div>
            </CardHeader>
            <CardContent>
              <div className="text-[10px] font-black flex items-center text-brand-green bg-brand-green/10 w-fit px-2.5 py-1 rounded-full border border-brand-green/20">
                <TrendingUp className="h-3 w-3 mr-1" /> +$245.00 (5.8%) hoy
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {positions
                .sort((a, b) => Math.abs(a.orderPrice - a.marketPrice) - Math.abs(b.orderPrice - b.marketPrice))
                .map((pos) => {
                    const expectedGain = (pos.marketPrice - pos.orderPrice) * pos.totalAmount;
                    const marketValue = pos.filledAmount * pos.marketPrice;
                    const progress = (pos.filledAmount / pos.totalAmount) * 100;
                    
                    return (
                        <Card key={pos.id} className="bg-linear-to-br from-muted/20 via-muted/5 to-transparent border-muted/20 overflow-hidden group shadow-md transition-all hover:scale-[1.02]">
                            <CardContent className="p-0">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-12 w-12 rounded-2xl bg-linear-to-br flex items-center justify-center text-white shadow-lg", pos.logoColor)}>
                                                <Layers className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base tracking-tight">{pos.tokenName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                        {pos.filledAmount} / {pos.totalAmount} TOKENS
                                                    </span>
                                                    <Badge variant="secondary" className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-none">
                                                        {Math.round(progress)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Valor Actual</div>
                                            <div className="text-xl font-black tracking-tighter text-foreground">${marketValue.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-background/40 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
                                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 opacity-60">Tu Orden</div>
                                            <div className="text-sm font-black">${pos.orderPrice.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-background/40 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
                                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mb-1 opacity-60">Mercado</div>
                                            <div className="text-sm font-black">${pos.marketPrice.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-1">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Ganancia Esperada</span>
                                                <span className="text-xs font-black text-brand-green">
                                                    +{expectedGain > 0 ? '$' : '-$'}{Math.abs(expectedGain).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                                                Progresión
                                            </div>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden p-0.5 border border-white/5">
                                            <div 
                                                className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            }
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Stats Bar near bottom */}
      {!selectedToken && (
        <div className="fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom-2 duration-500">
          <div className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex justify-between items-center shadow-2xl">
            <div className="flex gap-4 overflow-x-auto text-[9px] uppercase font-black tracking-widest no-scrollbar w-full justify-around">
              <div className="flex flex-col items-center"><span className="text-muted-foreground opacity-60">Proyectos</span><span className="text-foreground">24</span></div>
              <div className="flex flex-col items-center"><span className="text-muted-foreground opacity-60">Cap. Total</span><span className="text-foreground">$12.4M</span></div>
              <div className="flex flex-col items-center"><span className="text-muted-foreground opacity-60">Vol 24h</span><span className="text-brand-green">$1.2M</span></div>
              <div className="flex flex-col items-center"><span className="text-muted-foreground opacity-60">Tokens</span><span className="text-foreground">156</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Token Quick Action Panel - Shows OVER Bottom Nav as requested */}
      {selectedToken && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-300">
            <div className="bg-card/95 backdrop-blur-3xl border border-primary/30 shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.4)] rounded-[32px] p-6 overflow-hidden relative">
                {/* Close Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedTokenId(null)}
                    className="absolute top-4 right-4 rounded-full h-8 w-8 hover:bg-muted"
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                                    {selectedToken.name}
                                </span>
                                <Badge className="bg-brand-green/20 text-brand-green border-0 text-[9px] font-black uppercase">DISPONIBLE</Badge>
                            </div>
                            <h3 className="text-xl font-black text-foreground">{selectedToken.project}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> ROI Est: {selectedToken.roi}%</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Nuñez, BA</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-foreground">${selectedToken.price.toFixed(2)}</div>
                            <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">Stock: {selectedToken.tokensAvailable} Tokens</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                        >
                            <Info className="w-4 h-4 mr-2" /> Detalles
                        </Button>
                        <Button 
                            className="flex-[1.5] h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-xs"
                        >
                            Comprar Ahora
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
