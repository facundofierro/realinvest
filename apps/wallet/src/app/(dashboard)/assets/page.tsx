import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { 
    Building2, 
    Wallet, 
    TrendingUp, 
    Tag,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

export default function AssetsPage() {
  const myTokens = [
    { 
        id: "1",
        unitId: "12A",
        tokenName: "VEX-TORRE-L-12-A",
        projectName: "Torre Libertador 8000", 
        location: "Nuñez, BA", 
        tokens: "500.00", 
        value: "52,000.00", 
        change: "+5.2%", 
        marketPrice: "104.00",
        orderPrice: "100.00",
        color: "bg-blue-500",
        borderColor: "border-blue-500" 
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
        borderColor: "border-emerald-500" 
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
        borderColor: "border-orange-500" 
    }
  ];

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Main Balance Card - Using Dashboard colors */}
      <Card className="bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white border-none shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <CardContent className="p-6 space-y-4 relative z-10">
            <div className="space-y-1">
                <span className="text-white/60 text-sm font-medium">Valor Total</span>
                <div className="text-4xl font-bold tracking-tighter">$ 124,500.00</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-brand-green text-sm font-medium bg-brand-green/10 px-2 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.5%
                    </span>
                    <span className="text-xs text-white/40">último mes</span>
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <Button className="w-full bg-white/10 hover:bg-white/20 border-0 backdrop-blur-sm h-11 text-xs" asChild>
                    <Link href="/deposit">
                        <ArrowDownLeft className="mr-2 h-4 w-4" /> Ingresar
                    </Link>
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 border-0 backdrop-blur-sm h-11 text-xs" asChild>
                     <Link href="/withdraw">
                        <ArrowUpRight className="mr-2 h-4 w-4" /> Retirar
                     </Link>
                </Button>
            </div>
          </CardContent>
      </Card>

      {/* Liquidity First */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Liquidez</h2>
        <Card className="bg-card border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0 flex border-l-4 border-primary">
                <div className="p-4 flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-2xl group-hover:scale-110 transition-transform">
                             <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Liquidez Disponible</p>
                            <p className="text-[10px] text-muted-foreground">USDT (TRC20)</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-lg">$ 19,000.00</p>
                         <div className="flex gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href="/deposit" className="text-[10px] text-primary font-bold hover:underline">Depositar</Link>
                            <span className="text-muted-foreground text-[10px]">•</span>
                            <Link href="/withdraw" className="text-[10px] text-primary font-bold hover:underline">Retirar</Link>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Token List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mis Tokens</h2>
        </div>
        
        <div className="space-y-4">
            {myTokens.map((asset) => (
                <Card key={asset.id} className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all group rounded-[28px] bg-card">
                    <CardContent className="p-5">
                        <div className="grid grid-cols-[1fr_120px] items-center gap-x-6">
                            <div className="flex gap-4 items-center min-w-0">
                                <div className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center font-black text-base transition-colors shrink-0",
                                    "bg-muted/30 text-[#3B2146] border border-border/50"
                                )}>
                                    {asset.unitId}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight truncate">
                                        {asset.tokenName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase truncate">
                                            {asset.projectName}
                                        </div>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-brand-green/20 bg-brand-green/10 text-brand-green font-black shrink-0">
                                            {asset.change}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 flex items-center tracking-widest uppercase mt-0.5">
                                        <Building2 className="h-2.5 w-2.5 mr-1" /> {asset.location}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end text-right">
                                <div className="text-xl font-black text-[#3B2146] tracking-tighter">$ {asset.value}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{asset.tokens} Tokens</div>
                                {asset.orderPrice && (
                                    <Badge className="mt-1 bg-brand-pink/10 text-brand-pink border-brand-pink/20 text-[9px] px-2 py-0.5 h-auto font-black uppercase tracking-tighter">
                                        Posición: ${asset.orderPrice}
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
  );
}
