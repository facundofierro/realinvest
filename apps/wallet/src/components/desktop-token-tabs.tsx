"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import { MarketToken, ProjectUnit } from "@/types/wallet";
import Image from "next/image";
import { Building2, Layers, MapPin, Maximize2, Star, TrendingUp, TrendingDown, Info, Layout, ShoppingCart } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

interface DesktopTokenTabsProps {
  token: MarketToken;
  onClose?: () => void;
}

export function DesktopTokenTabs({ token, onClose }: DesktopTokenTabsProps) {
  const [activeTab, setActiveTab] = useState("project");

  const isUp = token.change24hPct >= 0;

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl border shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b bg-muted/10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg border border-primary/20">
              {token.symbol.split("-").at(-1)?.slice(0, 3)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#3B2146] uppercase leading-none">{token.symbol}</h2>
              <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">{token.projectTitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#3B2146] leading-none">${token.priceUsd.toFixed(2)}</div>
            <div className={cn(
              "text-xs font-black uppercase mt-1 flex items-center justify-end gap-1",
              isUp ? "text-brand-green" : "text-brand-pink"
            )}>
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isUp ? "+" : ""}{token.change24hPct.toFixed(1)}% (24h)
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md h-12 bg-muted/50 p-1 rounded-2xl border border-border/20">
            <TabsTrigger value="project" className="rounded-xl flex gap-2 items-center text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Info className="h-3.5 w-3.5" />
              Proyecto
            </TabsTrigger>
            <TabsTrigger value="unit" className="rounded-xl flex gap-2 items-center text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Layout className="h-3.5 w-3.5" />
              Unidad
            </TabsTrigger>
            <TabsTrigger value="invest" className="rounded-xl flex gap-2 items-center text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ShoppingCart className="h-3.5 w-3.5" />
              Invertir
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="project" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Sobre el Desarrollo</h3>
              <p className="text-base text-foreground/80 leading-relaxed font-medium">
                Este desarrollo de vanguardia redefine el lujo urbano en Nuñez. Con terminaciones de primer nivel,
                amenities premium y una ubicación estratégica frente al corredor norte, representa una oportunidad
                excepcional de inversión con alta apreciación proyectada.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">ROI Estimado</h4>
                  <div className="text-2xl font-black text-primary">{token.roiPct?.toFixed(1) || "12.5"}%</div>
                  <p className="text-[10px] text-primary/60 mt-1 uppercase font-bold">Anual proyectado</p>
               </div>
               <div className="p-6 rounded-[28px] bg-muted/30 border border-border/40">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Marketcap</h4>
                  <div className="text-2xl font-black text-[#3B2146]">${(token.marketCapUsd / 1000).toFixed(0)}K</div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold">Valuación total</p>
               </div>
            </div>

            <section>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Ubicación</h3>
               <div className="relative w-full h-48 rounded-3xl bg-muted overflow-hidden border">
                  <Image src="https://images.unsplash.com/photo-1577086664693-894d8405334a?q=80&w=1000&auto=format&fit=crop" fill className="object-cover opacity-80" alt="Map" />
                  <div className="absolute inset-0 bg-primary/10" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-background/90 backdrop-blur shadow-lg border flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                        <div className="font-black text-sm uppercase">Libertador 8000, Nuñez</div>
                        <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Buenos Aires, Argentina</div>
                     </div>
                  </div>
               </div>
            </section>
          </TabsContent>

          <TabsContent value="unit" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Detalles de la Unidad</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Building2, label: "Piso", value: "12" },
                  { icon: Layers, label: "Tipo", value: "3 Ambientes" },
                  { icon: Maximize2, label: "Superficie", value: "75 M²" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/40 text-center">
                    <item.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{item.label}</div>
                    <div className="text-sm font-black text-[#3B2146]">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Plano Arquitectónico</h3>
              <div className="relative w-full aspect-video rounded-3xl bg-white border shadow-inner flex items-center justify-center p-8">
                 <Image src="/building_floor_layout.png" fill className="object-contain p-8" alt="Floor Plan" />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="invest" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-full min-h-[400px]">
             <div className="flex flex-col items-center text-center max-w-sm mb-8">
                <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center mb-6 border-2 border-primary/20 shadow-xl">
                   <ShoppingCart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-[#3B2146] uppercase mb-4">¿Listo para invertir?</h3>
                <p className="text-muted-foreground font-medium mb-8">
                   Podrás realizar órdenes de compra y venta en tiempo real desde el exchange principal de este proyecto.
                </p>
                <Button 
                   size="lg" 
                   className="w-full rounded-[20px] h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30"
                   onClick={() => window.location.href = `/exchange/${encodeURIComponent(token.symbol)}`}
                >
                   Ir al Terminal de Trading
                </Button>
             </div>
             
             <div className="w-full p-6 rounded-[32px] bg-muted/20 border border-dashed border-muted-foreground/30 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tokens Disponibles</p>
                <div className="text-2xl font-black text-[#3B2146] mt-2">
                   {(token.tokensAvailable || 1250).toLocaleString()} UNITS
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
