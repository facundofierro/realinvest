"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { 
    Building2, 
    ArrowRight,
    LucideIcon,
    Hammer,
    Key,
    Clock,
    Search,
    SlidersHorizontal
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";
import Image from "next/image";

interface Category {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
}

interface Project {
    id: string;
    title: string;
    location: string;
    image: string;
    status: string;
    statusColor: string;
    tir: string;
    progress: number;
    desde: string;
    renta: string;
}

export default function InvestPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories: Category[] = [
    { 
        id: "all", 
        label: "Todos", 
        icon: Building2, 
        color: "bg-primary text-primary-foreground"
    },
    { 
        id: "upcoming", 
        label: "Lanzamientos", 
        icon: Clock, 
        color: "bg-blue-500/10 text-blue-600"
    },
    { 
        id: "construction", 
        label: "En obra", 
        icon: Hammer, 
        color: "bg-amber-500/10 text-amber-600"
    },
    { 
        id: "finished", 
        label: "Completados", 
        icon: Key, 
        color: "bg-purple-500/10 text-purple-600"
    },
  ];

  const projects: Project[] = [
    { 
        id: "1", 
        title: "Torre Libertador 8000", 
        location: "Nuñez, Buenos Aires", 
        image: "/projects/torre-libertador.png",
        status: "En Construcción",
        statusColor: "bg-black/40",
        tir: "12%",
        progress: 65,
        desde: "$100.000",
        renta: "12%"
    },
    { 
        id: "2", 
        title: "Barrio El Ceibo", 
        location: "Pilar, Buenos Aires", 
        image: "/projects/barrio-el-ceibo.png",
        status: "Pre-Venta",
        statusColor: "bg-accent/90",
        tir: "18%",
        progress: 30,
        desde: "$100.000",
        renta: "18%"
    },
    { 
        id: "3", 
        title: "Residencial Las Heras", 
        location: "Recoleta, BSAS", 
        image: "/projects/torre-libertador.png", // Reusing image for demo
        status: "En Obra",
        statusColor: "bg-blue-600/80",
        tir: "14%",
        progress: 85,
        desde: "$150.000",
        renta: "14%"
    },
    { 
        id: "4", 
        title: "Oficinas Madero", 
        location: "Puerto Madero, CABA", 
        image: "/projects/barrio-el-ceibo.png", // Reusing image for demo
        status: "Terminado",
        statusColor: "bg-emerald-600/80",
        tir: "8.5%",
        progress: 100,
        desde: "$250.000",
        renta: "8.5%"
    },
    { 
        id: "5", 
        title: "Paseo del Sol", 
        location: "Mendoza, Argentina", 
        image: "/projects/torre-libertador.png",
        status: "Próximamente",
        statusColor: "bg-purple-600/80",
        tir: "22%",
        progress: 0,
        desde: "$80.000",
        renta: "22%"
    },
    { 
        id: "6", 
        title: "Eco-Habitat", 
        location: "Tigre, Buenos Aires", 
        image: "/projects/barrio-el-ceibo.png",
        status: "En Obra",
        statusColor: "bg-blue-600/80",
        tir: "15%",
        progress: 45,
        desde: "$120.000",
        renta: "15%"
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in duration-500 overflow-x-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Oportunidades</h1>
            <p className="text-xs text-muted-foreground">Explorá los mejores proyectos inmobiliarios</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full shadow-sm bg-card border-muted/20">
                <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full shadow-sm bg-card border-muted/20">
                <SlidersHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      {/* Categories Tabs-like horizontal selection */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((cat) => (
            <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border shrink-0",
                    selectedCategory === cat.id 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                        : "bg-card border-muted/20 text-muted-foreground hover:border-muted-foreground/30"
                )}
            >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
            </button>
        ))}
      </div>

      {/* Modern Grid Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
                Todos los activos
                <Badge variant="secondary" className="bg-primary/5 text-[10px] text-primary border-none">{projects.length} resultados</Badge>
            </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {projects.map((project) => (
                <Link href={`/project/${project.id}`} key={project.id}>
                    <Card className="overflow-hidden border-none shadow-md group bg-card transition-all hover:scale-[1.02] flex flex-col h-full">
                        <div className="h-28 relative shrink-0">
                            <Image 
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                            <div className={cn(
                                "absolute top-2 right-2 text-[8px] uppercase font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm text-white flex flex-col items-center gap-1",
                                project.statusColor
                            )}>
                                {project.status}
                                {project.status === "En Construcción" && (
                                    <div className="w-full bg-white/20 h-0.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-white h-full transition-all duration-1000" 
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-3 flex flex-col flex-1 gap-2">
                            <div className="space-y-1">
                                <div className="flex justify-between items-start gap-1">
                                    <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors flex-1">{project.title}</h3>
                                    <span className="text-[10px] font-bold text-primary">{project.tir}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex items-center truncate">
                                    <Building2 className="h-2.5 w-2.5 mr-1 shrink-0" /> {project.location.split(',')[0]}
                                </p>
                            </div>

                            <div className="mt-auto space-y-2">
                                <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary h-full transition-all duration-1000" 
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                                
                                <div className="space-y-0.5">
                                    <div className="flex justify-between text-[9px] text-muted-foreground">
                                        <span className="font-medium">Desde:</span>
                                        <span className="font-bold text-foreground">{project.desde}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-muted-foreground">
                                        <span className="font-medium">Renta fija:</span>
                                        <span className="font-bold text-foreground">{project.renta}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </div>

      {/* Exchange Banner */}
      <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
        <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
                <h4 className="text-sm font-bold">¿Buscás el Mercado Secundario?</h4>
                <p className="text-[11px] text-muted-foreground">Comprá y vendé tokens de otros usuarios en tiempo real.</p>
            </div>
            <Button size="sm" className="rounded-xl h-9 px-4 text-xs font-bold" asChild>
                <Link href="/exchange">
                    Ir al Exchange
                    <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
            </Button>
        </div>
      </Card>
    </div>
  );
}
