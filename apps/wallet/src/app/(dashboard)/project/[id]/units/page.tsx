"use client";

import { useState, useMemo } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/components/ui/dialog";
import { ArrowLeft, ChevronRight, Filter, Info, MapPin, Building2, Layers, CheckCircle2, Maximize2, X, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ALL_UNITS from "@/sample-data/projectUnits.json";

interface Unit {
    id: string;
    type: string;
    floor: string;
    status: string;
    statusRaw?: string;
    price: string;
    tokenName?: string;
    totalTokens?: number;
    tokensSold?: number;
    isTokenized: boolean;
    investmentType?: string;
    area: string;
    orientation: string;
    negotiatedAmount?: string;
    queueOrder?: number;
}

export default function ProjectUnitsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter');
    
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const filteredUnits = useMemo(() => {
        // Cast imported JSON to Unit[]
        const units = ALL_UNITS as unknown as Unit[];
        
        return units.filter(unit => {
            // 1. Filter out blocked units
            if (unit.statusRaw === 'blocked') return false;

            // 2. Apply requested filter
            if (filter === 'full_property') {
                return unit.investmentType === 'full_property';
            }
            if (filter === 'tokenized') {
                // "Tokens en lanzamiento" - excludes fixed rent
                return unit.investmentType === 'appreciation';
            }
            if (filter === 'fixed_rent') {
                return unit.investmentType === 'fixed_rent';
            }
            
            return true;
        }).sort((a, b) => {
            // Sort logic: 
            // If fixed rent, sort by queueOrder
            if (filter === 'fixed_rent' && a.queueOrder && b.queueOrder) {
                return a.queueOrder - b.queueOrder;
            }
            // Otherwise sort by floor/unit
            return a.id.localeCompare(b.id);
        });
    }, [filter]);

    const selectedUnit = filteredUnits.find(u => u.id === selectedUnitId);
    
    const getPageTitle = () => {
        switch(filter) {
            case 'full_property': return 'Propiedades Completas';
            case 'tokenized': return 'Tokens en Lanzamiento';
            case 'fixed_rent': return 'Renta Fija';
            default: return 'Unidades del Proyecto';
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col pb-40">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white px-4 py-5 rounded-b-[40px] shadow-xl border-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full text-white hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="text-center flex-1 pr-10">
                        <h1 className="text-xl font-black uppercase tracking-tight leading-none text-white">{getPageTitle()}</h1>
                        <p className="text-sm font-medium text-white/70 mt-1 font-serif italic">Torre Libertador 8000</p>
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="px-4 pt-8 pb-3 border-b border-border/50 bg-muted/10 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 min-w-max">
                    <button 
                        onClick={() => router.push(`/project/${params.id}/units?filter=full_property`)}
                        className={`h-10 px-4 rounded-full border text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ${filter === 'full_property' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/50 border-border/50 text-muted-foreground'}`}
                    >
                        Propiedad Completa
                    </button>
                    <button 
                         onClick={() => router.push(`/project/${params.id}/units?filter=tokenized`)}
                        className={`h-10 px-4 rounded-full border text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ${filter === 'tokenized' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/50 border-border/50 text-muted-foreground'}`}
                    >
                        Tokens Lanzamiento
                    </button>
                    <button 
                         onClick={() => router.push(`/project/${params.id}/units?filter=fixed_rent`)}
                        className={`h-10 px-4 rounded-full border text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ${filter === 'fixed_rent' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/50 border-border/50 text-muted-foreground'}`}
                    >
                        Renta Fija
                    </button>
                </div>
            </div>

            {/* Units List */}
            <main className="flex-1 p-4 space-y-4">
                {filteredUnits.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No hay unidades disponibles en esta categoría.</p>
                    </div>
                ) : (
                    filteredUnits.map(unit => {
                        const isSoldOut = unit.statusRaw === 'sold_out';
                        const isUpcoming = unit.statusRaw === 'upcoming';
                        const isAvailable = unit.statusRaw === 'available';
                        
                        return (
                        <div 
                            key={unit.id} 
                            onClick={() => !isUpcoming && setSelectedUnitId(unit.id)}
                            className={`flex flex-col p-4 rounded-[28px] transition-all cursor-pointer border ${
                                selectedUnitId === unit.id 
                                ? 'bg-white border-primary shadow-xl scale-[1.02] z-10 relative' 
                                : isUpcoming 
                                    ? 'bg-muted/10 border-border/20 opacity-60 cursor-not-allowed'
                                    : 'bg-card border-border/40 hover:border-primary/30 shadow-sm'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                                        selectedUnitId === unit.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 text-[#3B2146] border border-border/50'
                                    }`}>
                                        {isUpcoming ? <Lock className="w-6 h-6 opacity-50" /> : unit.floor + unit.type.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight">{unit.type} • Piso {unit.floor}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">
                                            {unit.isTokenized ? (unit.tokenName || 'Tokenizado') : 'Venta tradicional'}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[17px] font-black text-[#3B2146] leading-tight">{unit.price}</div>
                                    <div className={`text-[10px] font-black uppercase mt-1 ${
                                        isAvailable ? 'text-brand-green' : (isSoldOut ? 'text-red-500' : 'text-muted-foreground')
                                    }`}>
                                        {unit.status}
                                    </div>
                                </div>
                            </div>

                            {unit.isTokenized && !isUpcoming && (
                                <div className="mt-4 flex items-end gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[11px] font-black text-primary">
                                                {unit.tokensSold ?? 0} / {unit.totalTokens ?? 0} 
                                                <span className="text-muted-foreground text-[9px] font-bold ml-1 uppercase">Tokens</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all duration-1000" 
                                                style={{ width: `${((unit.tokensSold ?? 0) / (unit.totalTokens ?? 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Only show 'Buy' button area if available */}
                                    {isAvailable && (
                                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                                {filter === 'fixed_rent' ? 'Depositar' : 'Comprar'}
                                            </span>
                                            <div className="bg-linear-to-r from-brand-lime via-brand-green to-brand-teal text-white py-1.5 px-3 rounded-full shadow-md shadow-brand-green/20 flex items-center gap-1.5">
                                                <span className="text-[13px] font-black leading-none">$100</span>
                                                <span className="text-[8px] font-black leading-none opacity-80 uppercase tracking-tighter">USDT</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )})
                )}
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
                            src="/building_floor_layout.png" 
                            fill
                            className="object-contain bg-white"
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

