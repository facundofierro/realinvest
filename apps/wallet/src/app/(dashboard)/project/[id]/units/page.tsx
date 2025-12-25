"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/components/ui/dialog";
import { ArrowLeft, ChevronRight, Filter, Info, MapPin, Building2, Layers, CheckCircle2, Maximize2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

const UNITS = [
    { id: "101", type: "2 Amb", floor: "1", status: "Disponible", price: "$125,000", tokens: 1250, area: "55m²", orientation: "Norte" },
    { id: "402", type: "3 Amb", floor: "4", status: "Vendido", price: "$210,000", tokens: 2100, area: "85m²", orientation: "Sur" },
    { id: "805", type: "Studio", floor: "8", status: "Disponible", price: "$95,000", tokens: 950, area: "35m²", orientation: "Este" },
    { id: "1201", type: "Penth.", floor: "12", status: "Reservado", price: "$450,000", tokens: 4500, area: "145m²", orientation: "Norte" },
    { id: "302", type: "2 Amb", floor: "3", status: "Disponible", price: "$130,000", tokens: 1300, area: "58m²", orientation: "Oeste" },
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
            <header className="sticky top-0 z-50 bg-primary text-primary-foreground px-4 py-8 rounded-b-[40px] shadow-lg">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full text-primary-foreground hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="text-center flex-1 pr-10">
                        <h1 className="text-2xl font-black uppercase tracking-tight leading-none">Unidades Etapa 1</h1>
                        <p className="text-xs font-medium text-white/80 mt-1">Ubicación y disponibilidad en tiempo real</p>
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
                        className={`flex items-center justify-between p-4 rounded-[28px] transition-all cursor-pointer border-2 ${
                            selectedUnitId === unit.id 
                            ? 'bg-white border-primary shadow-xl scale-[1.02] z-10 relative' 
                            : 'bg-[#F8F7F9] border-transparent hover:border-muted-foreground/10'
                        }`}
                    >
                        <div className="flex gap-4 items-center">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                                selectedUnitId === unit.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-[#3B2146] shadow-sm'
                            }`}>
                                {unit.id}
                            </div>
                            <div>
                                <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight">{unit.type} • Piso {unit.floor}</div>
                                <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">{unit.tokens} tokens equivalents</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[17px] font-black text-[#3B2146] leading-tight">{unit.price}</div>
                            <div className={`text-[10px] font-black uppercase mt-1 ${unit.status === 'Disponible' ? 'text-brand-green' : 'text-brand-pink'}`}>
                                {unit.status}
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* Action Footer */}
            {selectedUnit && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-full duration-300">
                    <div className="bg-card/95 backdrop-blur-2xl border border-primary/20 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.3)] rounded-[32px] p-6 overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                        
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-black tracking-tight">Unidad {selectedUnit.id}</h3>
                                        <Badge className="bg-brand-green/20 text-brand-green border-0 text-[10px] font-bold">DISPONIBLE</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {selectedUnit.type}</span>
                                        <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> {selectedUnit.area}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Vista {selectedUnit.orientation}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-foreground">{selectedUnit.price}</div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-tighter">o {selectedUnit.tokens} Tokens</div>
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
                                    <MapPin className="w-4 h-4 text-primary" /> Vista Despejada {selectedUnit?.orientation}
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

