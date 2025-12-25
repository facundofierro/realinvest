"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { 
    Search, 
    Building2, 
    TrendingUp, 
    SlidersHorizontal, 
    Coins, 
    Home, 
    Clock, 
    ArrowRight,
    LucideIcon
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";

interface ProjectOption {
    id: string;
    title: string;
    location: string;
    type: string;
    yield: string;
    minInvest: string;
    status: string;
    icon: LucideIcon;
}

export default function InvestPage() {
  const [activeTab, setActiveTab] = useState("tokenized");

  const popularOptions: ProjectOption[] = [
    { 
        id: "1", 
        title: "Residencial Las Heras", 
        location: "Buenos Aires", 
        type: "En Obra", 
        yield: "12% Anual", 
        minInvest: "$500", 
        status: "85% Financiado",
        icon: Building2
    },
    { 
        id: "2", 
        title: "Oficinas Puerto Madero", 
        location: "CABA", 
        type: "Terminado", 
        yield: "8% Rentabilidad", 
        minInvest: "$1,200", 
        status: "Disponible",
        icon: Building2
    },
    { 
        id: "3", 
        title: "Barrio Cerrado Los Álamos", 
        location: "Mendoza", 
        type: "Loteo", 
        yield: "+25% Plusvalía", 
        minInvest: "$2,000", 
        status: "Últimas Unidades",
        icon: Home
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Oportunidades</h1>
        <Button variant="outline" size="icon" className="rounded-full">
            <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="tokenized" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl h-12">
            <TabsTrigger value="tokenized" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Coins className="h-4 w-4 mr-2" />
                Tokenizados
            </TabsTrigger>
            <TabsTrigger value="traditional" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Home className="h-4 w-4 mr-2" />
                Tradicionales
            </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                <p className="text-xs text-primary-foreground/70 font-medium mb-1 uppercase tracking-wider">
                    {activeTab === 'tokenized' ? 'Inversión por Tokens' : 'Compra Tradicional'}
                </p>
                <h2 className="text-lg font-bold text-primary">
                    {activeTab === 'tokenized' 
                        ? 'Obtené renta fija con activos tokenizados' 
                        : 'Invertí en propiedades de forma tradicional'}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === 'tokenized'
                        ? 'Participá de proyectos inmobiliarios desde montos bajos y recibí intereses periódicos hasta la venta del activo.'
                        : 'Accedé a la compra directa de unidades terminadas o en construcción con escritura o boleto de compra-venta.'}
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Opciones Populares</h3>
                    <Button variant="link" size="sm" className="text-primary p-0">
                        Ver todas
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                <div className="grid gap-4">
                    {popularOptions.map((opt) => (
                        <Link href={`/project/${opt.id}`} key={opt.id}>
                            <Card className="overflow-hidden hover:shadow-md transition-all border-none bg-card shadow-sm">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-4 gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                            <opt.icon className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold truncate">{opt.title}</h4>
                                                <Badge variant="outline" className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border-emerald-100">
                                                    {opt.yield}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-2">{opt.location}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center text-[10px] text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {opt.type}
                                                </div>
                                                <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                                                    Min: {opt.minInvest}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted overflow-hidden">
                                        <div className={`h-full bg-primary ${opt.id === '1' ? 'w-[85%]' : opt.id === '2' ? 'w-full' : 'w-[45%]'}`}></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <Button variant="ghost" className="w-full text-muted-foreground text-xs py-1" asChild>
                <Link href="/exchange">
                    ¿Buscás comprar tokens de otros usuarios? Ir al Exchange
                    <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
            </Button>
        </div>
      </Tabs>
    </div>
  );
}
