"use client";

import { useState, useEffect } from "react";
import { MapPin, Layers, Building2, Maximize2 } from "lucide-react";
import { UnitDetailsSheet } from "./unit-details-sheet";
import { UnitDetailsActions } from "./unit-details-actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MarketToken, ProjectUnit } from "@/types/wallet";

interface UnitDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: MarketToken | ProjectUnit | null;
  onInvest?: (data: MarketToken | ProjectUnit) => void;
  actions?: React.ReactNode;
}

export function UnitDetailsDialog({ isOpen, onClose, data, onInvest, actions: actionsProp }: UnitDetailsDialogProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("plano");

  // Reset expansion state when diaog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      setActiveTab("plano");
    }
  }, [isOpen]);

  const parsePriceToNumber = (price?: string): number => {
    if (!price) return 0;
    const n = Number(price.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  if (!data) return null;

  // Unified mapping
  const isMarketToken = 'priceUsd' in data && 'marketCapUsd' in data;
  
  const symbol = isMarketToken ? data.symbol : (data.tokenSymbol || data.unitCode);
  const title = isMarketToken ? data.projectTitle : "Torre Libertador 8000";
  
  let stockCount = 0;
  let displayPrice = 0;

  if (isMarketToken) {
    stockCount = data.tokensAvailable || 0;
    displayPrice = (data.priceUsd || 0) * stockCount;
  } else {
    const unit = data as ProjectUnit;
    const total = unit.totalTokens || 0;
    const sold = unit.tokensSold || 0;
    stockCount = Math.max(0, total - sold);
    const unitPriceNum = parsePriceToNumber(unit.price);
    
    if (unit.isTokenized && total > 0) {
      displayPrice = (unitPriceNum / total) * stockCount;
    } else {
      displayPrice = (unit.statusRaw === 'available' || unit.status === 'Disponible') ? unitPriceNum : 0;
    }
  }

  const stockText = `${stockCount.toLocaleString()} TOKENS AVAILABLE`;

  // Features mapping
  const featuresList = [];

  // 1. Details (Units or Mock for Tokens)
  if (!isMarketToken) {
    const unit = data as ProjectUnit;
    featuresList.push({ 
      icon: <Building2 className="w-3.5 h-3.5" />, 
      text: `Depto ${unit.unitCode} • Piso ${unit.floor}` 
    });
    featuresList.push({ 
      icon: <Layers className="w-3.5 h-3.5" />, 
      text: unit.type 
    });
    if (unit.area || unit.areaM2) {
      featuresList.push({ 
        icon: <Maximize2 className="w-3.5 h-3.5" />, 
        text: unit.area ?? `${unit.areaM2} M²` 
      });
    }
    if (unit.orientation) {
      featuresList.push({ 
        icon: <MapPin className="w-3.5 h-3.5" />, 
        text: `Vista ${unit.orientation}` 
      });
    }
  } else {
    // Market Token - Try to show similar structure
    featuresList.push({ 
      icon: <Building2 className="w-3.5 h-3.5" />, 
      text: "Unidad Tokenizada" 
    });
    featuresList.push({ 
      icon: <MapPin className="w-3.5 h-3.5" />, 
      text: "Nuñez, BA" 
    });
    if (data.roiPct) {
      featuresList.push({ 
        icon: <Layers className="w-3.5 h-3.5" />, 
        text: `ROI Est: ${data.roiPct.toFixed(1)}%` 
      });
    }
  }

  const handleOnClose = () => {
    setIsExpanded(false);
    onClose();
  };

  const actions = [
    {
      label: "PROYECTO",
      variant: "outline" as const,
      onClick: () => {
        if (isMarketToken) {
           const returnTo = encodeURIComponent(`/exchange/${encodeURIComponent(data.symbol)}`);
           router.push(`/project/1?returnTo=${returnTo}`);
        } else {
          setIsExpanded(true);
          setActiveTab("caracteristicas");
        }
      }
    },
    {
      label: "UNIDAD",
      variant: "outline" as const,
      onClick: () => {
        setIsExpanded(true);
        setActiveTab("plano");
      }
    },
    {
      label: "INVERTIR",
      variant: "primary" as const,
      onClick: () => {
        if (onInvest) {
          onInvest(data);
          return;
        }
        
        const targetSymbol = isMarketToken ? data.symbol : (data as ProjectUnit).tokenSymbol;
        if (targetSymbol) {
          router.push(`/exchange/${encodeURIComponent(targetSymbol)}`);
        }
      }
    }
  ];

  const finalActions = actionsProp || <UnitDetailsActions actions={actions} />;

  return (
    <UnitDetailsSheet
      isOpen={isOpen}
      onClose={handleOnClose}
      isExpanded={isExpanded}
      symbol={symbol}
      title={title}
      price={displayPrice}
      stockText={stockText}
      features={
        <div className={`flex flex-col gap-1.5 ${featuresList.length > 2 ? 'mt-1' : 'mt-0'}`}>
          {featuresList.slice(0, 4).map((f, i) => (
            <span key={i} className="flex gap-1.5 items-center">
              {f.icon} {f.text}
            </span>
          ))}
        </div>
      }
      actions={finalActions}
    >
      {isExpanded && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col w-full h-full">
          <TabsList className="grid grid-cols-2 p-1 mb-6 w-full rounded-xl bg-muted/50 border border-border/20">
            <TabsTrigger value="plano" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">Plano</TabsTrigger>
            <TabsTrigger value="caracteristicas" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">Detalles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plano" className="overflow-y-auto flex-1 mt-0 h-full pb-10">
                <div className="overflow-hidden relative w-full h-64 rounded-2xl bg-muted shrink-0 shadow-inner">
                  <Image
                    src={(!isMarketToken && (data as ProjectUnit).floorPlanImage) || "/building_floor_layout.png"}
                    fill
                    className="object-contain bg-white"
                    alt="Plano"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-6 text-white">
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      Plano Arquitectónico
                    </h2>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">
                      Visualización de Planta
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-6">
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">
                      Especificaciones Técnicas
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">Superficie</div>
                        <div className="text-sm font-black text-foreground">{!isMarketToken ? ((data as ProjectUnit).area ?? `${(data as ProjectUnit).areaM2} M²`) : "55 M²"}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">Orientación</div>
                        <div className="text-sm font-black text-foreground">{!isMarketToken ? (data as ProjectUnit).orientation : "Norte"}</div>
                      </div>
                    </div>
                  </section>
                </div>
          </TabsContent>

          <TabsContent value="caracteristicas" className="overflow-y-auto flex-1 mt-0 pb-10">
             <div className="space-y-6">
                 <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Sobre el Proyecto</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        Este desarrollo de vanguardia redefine el lujo urbano en Nuñez. Con terminaciones de primer nivel,
                        amenities premium y una ubicación estratégica frente al corredor norte, representa una oportunidad
                        excepcional de inversión con alta apreciación proyectada.
                    </p>
                 </section>
                 
                 <section className="p-5 rounded-[28px] bg-primary/5 border border-primary/10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 text-center">Inversión Tokenizada</h4>
                    <p className="text-[12px] text-primary/80 leading-relaxed text-center font-bold">
                        Esta unidad participa del programa de renta fija y apreciación de mercado. 
                        Los tokens son transferibles y liquidables en tiempo real.
                    </p>
                 </section>
             </div>
          </TabsContent>
        </Tabs>
      )}
    </UnitDetailsSheet>
  );
}
