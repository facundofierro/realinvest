"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { 
    Building2, 
    TrendingUp, 
    SlidersHorizontal, 
    Coins, 
    Home, 
    Clock, 
    ArrowRight,
    LucideIcon,
    Hammer,
    Key,
    PieChart,
    ChevronRight
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";

interface Category {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    description: string;
    subtext: string;
}

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
  const [selectedCategory, setSelectedCategory] = useState("tokenized_prop");

  const categories: Category[] = [
    { 
        id: "tokenized_prop", 
        label: "Propiedad tokenizada", 
        icon: Coins, 
        color: "bg-blue-500/10 text-blue-600 border-blue-200",
        description: "Participá de la propiedad de un activo real mediante tokens de forma flexible.",
        subtext: "Inversión por Tokens"
    },
    { 
        id: "tokenized_rent", 
        label: "Renta fija tokenizada", 
        icon: TrendingUp, 
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        description: "Obtené una renta fija garantizada financiando desarrollos inmobiliarios.",
        subtext: "Renta Asegurada"
    },
    { 
        id: "construction", 
        label: "Propiedad en construcción", 
        icon: Hammer, 
        color: "bg-amber-500/10 text-amber-600 border-amber-200",
        description: "Invertí en pozo de forma tradicional con contratos de compra-venta.",
        subtext: "Tradicional"
    },
    { 
        id: "finished", 
        label: "Propiedad finalizada", 
        icon: Key, 
        color: "bg-purple-500/10 text-purple-600 border-purple-200",
        description: "Adquirí unidades terminadas listas para escriturar o rentar inmediatamente.",
        subtext: "Tradicional"
    },
  ];

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

  const activeCategory = categories.find(c => c.id === selectedCategory) || categories[0];

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Oportunidades</h1>
        <Button variant="outline" size="icon" className="rounded-full shadow-sm">
            <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Category Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
        {categories.map((cat) => (
            <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                    "flex flex-col items-center justify-center min-w-[120px] h-[140px] rounded-2xl border transition-all duration-300 snap-center p-3 text-center gap-3",
                    selectedCategory === cat.id 
                        ? cat.color + " ring-2 ring-offset-2 ring-primary/20 shadow-md border-transparent scale-105" 
                        : "bg-card border-muted-foreground/10 text-muted-foreground hover:border-muted-foreground/30"
                )}
            >
                <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                    selectedCategory === cat.id ? "bg-white/50" : "bg-muted"
                )}>
                    <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold leading-tight">{cat.label}</span>
            </button>
        ))}
      </div>

      <div className="space-y-4">
            {/* Context Card */}
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <activeCategory.icon className="h-16 w-16" />
                </div>
                <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-widest">
                    {activeCategory.subtext}
                </p>
                <h2 className="text-lg font-bold">
                    {activeCategory.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {activeCategory.description}
                </p>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        Opciones Populares
                        <Badge variant="secondary" className="bg-primary/5 text-[10px] text-primary border-none">3 activos</Badge>
                    </h3>
                    <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                        Ver todas
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid gap-4">
                    {popularOptions.map((opt) => (
                        <Link href={`/project/${opt.id}`} key={opt.id}>
                            <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all border-none bg-card shadow-sm border border-muted/20">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-4 gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 border border-muted-foreground/5">
                                            <opt.icon className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold truncate text-sm">{opt.title}</h4>
                                                <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border-emerald-100 px-2 py-0">
                                                    {opt.yield}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-3">{opt.location}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center text-[10px] text-muted-foreground font-medium bg-muted/40 px-2 py-1 rounded-md">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {opt.type}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-bold">
                                                        Min: <span className="text-foreground">{opt.minInvest}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-muted/30">
                                        <div className={cn(
                                            "h-full bg-primary transition-all duration-1000",
                                            opt.id === '1' ? 'w-[85%]' : opt.id === '2' ? 'w-full' : 'w-[45%]'
                                        )}></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <Button variant="ghost" className="w-full text-muted-foreground text-[11px] py-4 h-auto group bg-card border border-muted/20 rounded-xl" asChild>
                <Link href="/exchange">
                    ¿Buscás comprar tokens de otros usuarios? 
                    <span className="text-primary font-bold ml-1 flex items-center group-hover:underline">
                        Ir al Exchange
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </span>
                </Link>
            </Button>
        </div>
    </div>
  );
}

