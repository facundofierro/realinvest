import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Building2, Wallet, TrendingUp, PieChart } from "lucide-react";
import Link from "next/link";

export default function AssetsPage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold tracking-tight">Mi Portafolio</h1>
         <Button variant="outline" size="icon" className="rounded-full">
            <PieChart className="h-5 w-5" />
         </Button>
      </div>

      {/* Main Balance */}
      <Card className="bg-primary text-primary-foreground border-none shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <CardContent className="p-6 space-y-4 relative z-10">
            <div className="space-y-1">
                <span className="text-primary-foreground/80 text-sm font-medium">Valor Total</span>
                <div className="text-4xl font-bold tracking-tighter">$ 124,500.00</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-emerald-300 text-sm font-medium bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.5%
                    </span>
                    <span className="text-xs text-primary-foreground/60">último mes</span>
                 </div>
            </div>
          </CardContent>
      </Card>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tokens">Mis Tokens</TabsTrigger>
          <TabsTrigger value="activity">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tokens" className="space-y-4 mt-4">
             {/* Asset List */}
             <div className="space-y-3">
                {[
                    { name: "Torre Libertador 8000", location: "Nuñez, BA", amount: "500 Tokens", value: "$ 52,000", change: "+5.2%", color: "bg-blue-500" },
                    { name: "Barrio El Ceibo", location: "Pilar, BA", amount: "350 Tokens", value: "$ 38,500", change: "+12.1%", color: "bg-emerald-500" },
                    { name: "Complex Office Jr", location: "Palermo, BA", amount: "120 Tokens", value: "$ 15,000", change: "+1.8%", color: "bg-orange-500" }
                ].map((asset, i) => (
                    <Card key={i} className="overflow-hidden border shadow-sm">
                        <CardContent className="p-0">
                            <Link href={`/project/${i + 1}`} className="flex items-stretch">
                                <div className={`w-2 ${asset.color}`} />
                                <div className="p-4 flex-1 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-sm">{asset.name}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                            <Building2 className="h-3 w-3 mr-1" /> {asset.location}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">{asset.value}</div>
                                        <div className="text-xs text-emerald-600 font-medium">{asset.change}</div>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
             </div>
             
             {/* Liquid Balance */}
            <Card className="bg-muted/30">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                             <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Liquidez Disponible</p>
                            <p className="text-xs text-muted-foreground">USDT (TRC20)</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="font-bold">$ 19,000.00</p>
                         <div className="flex gap-2 mt-1">
                            <Link href="/deposit" className="text-[10px] text-primary hover:underline">Depositar</Link>
                            <span className="text-muted-foreground text-[10px]">•</span>
                            <Link href="/withdraw" className="text-[10px] text-primary hover:underline">Retirar</Link>
                         </div>
                    </div>
                </CardContent>
            </Card>

        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
            <div className="space-y-4 text-center py-8">
                 <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium">Sin actividad reciente</h3>
                 <p className="text-sm text-muted-foreground">Tus transacciones aparecerán aquí.</p>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
