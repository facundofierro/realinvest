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
  Filter
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
    isFavorite: true 
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
    isFavorite: false 
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
    isFavorite: false 
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
    isFavorite: true 
  },
];

export default function ExchangePage() {
  const [tokens, setTokens] = useState<TokenData[]>(INITIAL_TOKENS);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"marketCap" | "change">("marketCap");
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">("all");
  const [showConfig, setShowConfig] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const toggleFavorite = (id: string) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

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
    <Card key={token.id} className="hover:bg-muted/30 transition-all cursor-pointer border-muted/20 overflow-hidden">
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
              <span className="truncate">{token.name}</span>
              <Badge variant="outline" className="font-normal text-[9px] py-0 h-4 border-muted/50 bg-muted/50 px-1">
                {token.liveSince}
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{token.project}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden xs:flex flex-col items-end">
            <div className="text-[10px] text-muted-foreground uppercase font-medium">Cap. Mkt</div>
            <div className="text-sm font-semibold">${token.marketCap}</div>
          </div>
          
          <div className="text-right flex items-center gap-4">
            <div className="hidden sm:block">
              <div className="text-[9px] text-muted-foreground uppercase font-medium">1 Mes</div>
              <div className={`text-xs font-semibold flex items-center justify-end ${token.change30d >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {token.change30d > 0 ? '+' : ''}{token.change30d}%
              </div>
            </div>
            
            <div className="w-20">
              <div className="font-bold text-base leading-tight">${token.price.toFixed(2)}</div>
              <div className={`text-xs flex items-center justify-end font-bold ${token.changeAll >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
    <div className="p-4 space-y-4 min-h-screen pb-24 bg-background/50">
      <div className="flex gap-4 overflow-x-auto text-[10px] text-muted-foreground pb-2 border-b border-muted/10 no-scrollbar">
        <span className="shrink-0">Proyectos: <span className="text-foreground font-semibold">24</span></span>
        <span className="shrink-0">Cap. Total: <span className="text-foreground font-semibold">$12.4M</span></span>
        <span className="shrink-0">Vol 24h: <span className="text-emerald-500 font-semibold">$1.2M (+4.5%)</span></span>
        <span className="shrink-0">Tokens: <span className="text-foreground font-semibold">156</span></span>
      </div>

      <div className="flex items-center justify-between pt-2">
        {isSearching ? (
          <div className="flex-1 mr-4 animate-in slide-in-from-right duration-300">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                autoFocus
                type="search" 
                placeholder="Buscar tokens o proyectos..." 
                className="pl-9 h-10 bg-muted/20 border-muted/10 rounded-xl focus-visible:ring-primary/20 backdrop-blur-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => {
                  if (search === "") setIsSearching(false);
                }}
              />
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in duration-500">
            Exchange
          </h1>
        )}
        <div className="flex gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm border-muted/20 transition-all",
              isSearching && "bg-primary/10 border-primary/30 text-primary"
            )}
            onClick={() => setIsSearching(!isSearching)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm border-muted/20">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-muted/20">
              <DialogHeader>
                <DialogTitle>Configurar vista</DialogTitle>
                <DialogDescription>
                  Personaliza qué información quieres ver en el mercado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-cap" defaultChecked />
                  <Label htmlFor="show-cap" className="text-sm font-medium leading-none">Market Cap</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-age" defaultChecked />
                  <Label htmlFor="show-age" className="text-sm font-medium leading-none">Antigüedad (Token live since)</Label>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Variación de precio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["1h", "24h", "7d", "30d", "1y", "All Time"].map((tf) => (
                      <div key={tf} className="flex items-center space-x-2">
                        <Checkbox id={`tf-${tf}`} defaultChecked={tf === "30d" || tf === "All Time"} />
                        <label htmlFor={`tf-${tf}`} className="text-sm">{tf}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowConfig(false)}>Guardar cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm border-muted/20">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/30 backdrop-blur-md rounded-full h-11 border border-muted/20">
          <TabsTrigger value="market" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Mercado</TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Favoritos</TabsTrigger>
          <TabsTrigger value="positions" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Mis Posiciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market" className="space-y-4 pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Button 
                variant={sortBy === "marketCap" ? "secondary" : "ghost"} 
                size="sm" 
                className={`rounded-full gap-1 shrink-0 h-8 transition-all ${sortBy === "marketCap" ? "shadow-sm bg-secondary text-white border-none" : ""}`}
                onClick={() => setSortBy("marketCap")}
              >
                <CircleDollarSign className="h-3.5 w-3.5" />
                Marketcap
              </Button>
              <Button 
                variant={sortBy === "change" ? "secondary" : "ghost"} 
                size="sm" 
                className={`rounded-full gap-1 shrink-0 h-8 transition-all ${sortBy === "change" ? "shadow-sm bg-secondary text-white border-none" : ""}`}
                onClick={() => setSortBy("change")}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                % Variación
              </Button>
              <div className="h-4 w-px bg-muted/30 mx-1 shrink-0" />
              <div className="flex gap-1">
                {(["24h", "7d", "30d", "all"] as const).map((tf) => (
                  <Button 
                    key={tf}
                    variant={timeframe === tf ? "secondary" : "ghost"} 
                    size="sm" 
                    className={`rounded-full px-3 h-8 text-[11px] uppercase tracking-wider transition-all ${timeframe === tf ? "shadow-sm font-bold bg-secondary text-white border-none" : ""}`}
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
                <p className="font-medium">No se encontraron tokens</p>
                <p className="text-xs">Prueba con otro nombre o proyecto</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4 pt-6">
          <div className="grid gap-3">
            {favorites.length > 0 ? (
              favorites.map((token) => (
                <TokenRow key={token.id} token={token} />
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground bg-muted/5 rounded-3xl border border-dashed border-muted/20">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No tienes tokens favoritos aún</p>
                <p className="text-xs max-w-[200px] mx-auto mt-1">Marca con una estrella los tokens que quieras seguir de cerca.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4 pt-6">
          <Card className="bg-linear-to-br from-primary/15 via-primary/5 to-transparent border-primary/10 overflow-hidden relative shadow-lg shadow-primary/5">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-150">
              <TrendingUp className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                Patrimonio Estimado
              </CardTitle>
              <div className="text-3xl font-bold tracking-tight text-foreground">$4,250.00</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-bold flex items-center text-emerald-500 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                +$245.00 (5.8%) este mes
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {[
              { id: "1", name: "VEX-ALAMOS-B3-522", amount: "1500", value: "1,875.00", roi: "12", change: "+2.4" },
              { id: "3", name: "VEX-VIVERO-A1-302", amount: "1000", value: "2,100.00", roi: "8", change: "+1.5" },
            ].map((pos) => (
              <Card key={pos.id} className="border-muted/20 hover:bg-muted/10 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      {pos.name}
                      <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-none font-bold">
                        +{pos.roi}% ROI
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{pos.amount} tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-base group-hover:text-primary transition-colors">${pos.value}</div>
                    <div className="text-[10px] text-emerald-500 font-bold">
                      {pos.change}% hoy
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
