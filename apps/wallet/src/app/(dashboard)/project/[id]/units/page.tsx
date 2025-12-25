"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/components/ui/dialog";
import { ArrowLeft, ChevronRight, Filter, Info, MapPin, Building2, Layers, CheckCircle2, Maximize2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface Unit {
    id: string;
    type: string;
    floor: string;
    status: string;
    price: string;
    tokenName?: string;
    totalTokens?: number;
    tokensSold?: number;
    isTokenized: boolean;
    area: string;
    orientation: string;
    negotiatedAmount?: string;
}

const UNITS: Unit[] = [
    { id: "101", type: "2 Amb", floor: "1", status: "Disponible", price: "$125,000", tokenName: "RIV-LIB8000-101", totalTokens: 1250, tokensSold: 450, isTokenized: true, area: "55m²", orientation: "Norte", negotiatedAmount: "125K" },
    { id: "402", type: "3 Amb", floor: "4", status: "Vendido", price: "$210,000", tokenName: "RIV-LIB8000-402", totalTokens: 2100, tokensSold: 2100, isTokenized: true, area: "85m²", orientation: "Sur", negotiatedAmount: "900K" },
    { id: "805", type: "Studio", floor: "8", status: "Disponible", price: "$95,000", isTokenized: false, area: "35m²", orientation: "Este" },
    { id: "1201", type: "Penth.", floor: "12", status: "Vendido", price: "$450,000", tokenName: "RIV-LIB8000-1201", totalTokens: 4500, tokensSold: 4500, isTokenized: true, area: "145m²", orientation: "Norte", negotiatedAmount: "5M" },
    { id: "302", type: "2 Amb", floor: "3", status: "Disponible", price: "$130,000", isTokenized: false, area: "58m²", orientation: "Oeste" },
];

export default function ProjectUnitsPage() {
    const params = useParams();
    const router = useRouter();
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const selectedUnit = UNITS.find(u => u.id === selectedUnitId);

    return (
        <div className="bg-background min-h-screen flex flex-col pb-40">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white px-4 py-8 rounded-b-[40px] shadow-xl border-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full text-white hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="text-center flex-1 pr-10">
                        <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-white">Etapa 1</h1>
                        <p className="text-sm font-medium text-white/70 mt-1 font-serif italic">Torre Libertador 8000</p>
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="px-4 py-2 border-b border-border/50 bg-muted/10 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1.5 min-w-max">
                    <button className="h-7 px-3 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-wider text-primary whitespace-nowrap">
                        Solo en Venta
                    </button>
                    <button className="h-7 px-3 rounded-full bg-secondary/50 border border-border/50 text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        Etapa 1
                    </button>
                    <button className="h-7 px-3 rounded-full bg-secondary/50 border border-border/50 text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        Tokenizado
                    </button>
                    <div className="h-3 w-px bg-border/50 mx-1" />
                    <button className="h-7 px-3 rounded-full bg-secondary/30 text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Filter className="w-2.5 h-2.5" /> Más Filtros
                    </button>
                </div>
            </div>

            {/* Units List */}
            <main className="flex-1 p-4 space-y-4">
                {UNITS.map(unit => (
                    <div 
                        key={unit.id} 
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`flex flex-col p-4 rounded-[28px] transition-all cursor-pointer border ${
                            selectedUnitId === unit.id 
                            ? 'bg-white border-primary shadow-xl scale-[1.02] z-10 relative' 
                            : 'bg-card border-border/40 hover:border-primary/30 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-4 items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                                    selectedUnitId === unit.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 text-[#3B2146] border border-border/50'
                                }`}>
                                    {unit.id}
                                </div>
                                <div>
                                    <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight">{unit.type} • Piso {unit.floor}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">
                                        {unit.isTokenized ? unit.tokenName : 'Tradicional'}
                                    </div>
                                </div>
                            </div>

                            {unit.isTokenized && unit.negotiatedAmount && (
                                <div className="flex flex-col items-center mx-2 min-w-max">
                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tokens en venta...</span>
                                    <div className="w-full bg-linear-to-r from-brand-lime via-brand-green to-brand-teal text-white text-[10px] font-black py-1 rounded-full shadow-md shadow-brand-green/20 flex items-center justify-center">
                                        {unit.negotiatedAmount} USDT
                                    </div>
                                </div>
                            )}

                            <div className="text-right">
                                <div className="text-[17px] font-black text-[#3B2146] leading-tight">{unit.price}</div>
                                <div className={`text-[10px] font-black uppercase mt-1 ${unit.status === 'Disponible' ? 'text-brand-green' : 'text-primary'}`}>
                                    {unit.status}
                                </div>
                            </div>
                        </div>

                        {unit.isTokenized && (
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progreso de Venta</span>
                                    <span className="text-[11px] font-black text-primary">
                                        {unit.tokensSold ?? 0} / {unit.totalTokens ?? 0} 
                                        <span className="text-muted-foreground text-[9px] font-bold ml-1">TOKENS</span>
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000" 
                                        style={{ width: `${((unit.tokensSold ?? 0) / (unit.totalTokens ?? 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </main>

            {/* Action Footer */}
            {selectedUnit && (
                <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-full duration-300">
                    <div className="bg-card/95 backdrop-blur-2xl border border-primary/20 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.3)] rounded-[32px] p-6 overflow-hidden relative">
                        <button 
                            onClick={() => setSelectedUnitId(null)}
                            className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 shadow-md transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                        
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-black tracking-tight">Unidad {selectedUnit.id}</h3>
                                        <Badge className={`border-0 text-[10px] font-bold ${selectedUnit.status === 'Disponible' ? 'bg-brand-green/20 text-brand-green' : 'bg-primary/20 text-primary'}`}>
                                            {selectedUnit.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {selectedUnit.type}</span>
                                        <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> {selectedUnit.area}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Vista {selectedUnit.orientation}</span>
                                    </div>
                                </div>
                                <div className="text-right pr-10">
                                    <div className="text-2xl font-black text-foreground">{selectedUnit.price}</div>
                                    {selectedUnit.isTokenized && (
                                        <div className="text-[10px] font-black text-primary uppercase tracking-tighter">o {selectedUnit.totalTokens} Tokens</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsDetailsOpen(true)}
                                    className="flex-1 h-14 rounded-2xl border-border/50 hover:bg-muted font-black uppercase tracking-widest text-xs"
                                >
                                    <Info className="w-4 h-4 mr-2" /> Ver Detalles
                                </Button>
                                <Button 
                                    className="flex-[1.5] h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 font-black uppercase tracking-widest text-xs"
                                >
                                    Invertir Ahora
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="h-48 bg-muted relative">
                        <Image 
                            src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=800" 
                            fill
                            className="object-cover"
                            alt="Plano"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-6 text-white">
                            <h2 className="text-xl font-black uppercase">Plano Arquitectónico</h2>
                            <p className="text-xs font-medium text-white/80">Unidad {selectedUnit?.id} • {selectedUnit?.type}</p>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dimensiones</span>
                                <div className="font-bold flex items-center gap-2">
                                    <Maximize2 className="w-4 h-4 text-primary" /> {selectedUnit?.area} Cubiertos
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Orientación</span>
                                <div className="font-bold flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> Vista {selectedUnit?.orientation}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Especificaciones</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    'Pisos de porcelanato italiano',
                                    'Grifería Hansgrohe de alta gama',
                                    'Balcón aterrazado con deck de madera',
                                    'Calefacción por losa radiante individual',
                                    'Aberturas de aluminio con doble vidriado'
                                ].map((spec, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                        <CheckCircle2 className="w-4 h-4 text-brand-green" /> {spec}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button 
                            variant="secondary" 
                            className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
                            onClick={() => setIsDetailsOpen(false)}
                        >
                            Cerrar Detalles
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

