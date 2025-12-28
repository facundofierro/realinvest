"use client";

import {
  useState,
  useMemo,
  useEffect,
} from "react";
import { Button } from "@repo/ui/components/ui/button";

import {
  ArrowLeft,
  Info,
  MapPin,
  Layers,
  CheckCircle2,
  Maximize2,
  X,
  Lock,
} from "lucide-react";
import Image from "next/image";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
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
  const searchParams =
    useSearchParams();
  const filter =
    searchParams.get("filter");

  const [
    selectedUnitId,
    setSelectedUnitId,
  ] = useState<string | null>(null);
  const [
    isDetailsOpen,
    setIsDetailsOpen,
  ] = useState(false);

  const filteredUnits = useMemo(() => {
    // Cast imported JSON to Unit[]
    const units =
      ALL_UNITS as unknown as Unit[];

    return units
      .filter((unit) => {
        // 1. Filter out blocked units
        if (
          unit.statusRaw === "blocked"
        )
          return false;

        // 2. Apply requested filter
        if (
          filter === "full_property"
        ) {
          return (
            unit.investmentType ===
            "full_property"
          );
        }
        if (filter === "tokenized") {
          // "Tokens en lanzamiento" - excludes fixed rent
          return (
            unit.investmentType ===
            "appreciation"
          );
        }
        if (filter === "fixed_rent") {
          return (
            unit.investmentType ===
            "fixed_rent"
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Sort logic:
        // If fixed rent, sort by queueOrder
        if (
          filter === "fixed_rent" &&
          a.queueOrder &&
          b.queueOrder
        ) {
          return (
            a.queueOrder - b.queueOrder
          );
        }
        // Otherwise sort by floor/unit
        return a.id.localeCompare(b.id);
      });
  }, [filter]);

  // Scroll to first available unit when filtering by fixed_rent
  useEffect(() => {
    if (filter === "fixed_rent") {
      // Small timeout to ensure DOM is rendered
      const timer = setTimeout(() => {
        const firstAvailable =
          filteredUnits.find(
            (u) =>
              u.statusRaw ===
              "available"
          );
        if (firstAvailable) {
          const element =
            document.getElementById(
              `unit-${firstAvailable.id}`
            );
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filter, filteredUnits]);

  const selectedUnit =
    filteredUnits.find(
      (u) => u.id === selectedUnitId
    );

  const getPageTitle = () => {
    switch (filter) {
      case "full_property":
        return "Propiedades Completas";
      case "tokenized":
        return "Tokens en Lanzamiento";
      case "fixed_rent":
        return "Renta Fija";
      default:
        return "Unidades del Proyecto";
    }
  };

  return (
    <div className="flex flex-col pb-40 min-h-screen bg-background">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 shadow-md bg-background">
        {/* Header */}
        <header className="bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white px-4 py-5 rounded-b-[40px] shadow-xl border-none overflow-hidden relative z-20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10"></div>

          <div className="flex relative z-10 gap-4 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.back()
              }
              className="text-white rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1 pr-10 text-center">
              <h1 className="text-xl font-black tracking-tight leading-none text-white uppercase">
                {getPageTitle()}
              </h1>
              <p className="mt-1 font-serif text-sm italic font-medium text-white/70">
                Torre Libertador 8000
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="relative z-10 px-4 py-3 pt-6 -mt-4 rounded-b-2xl border-b border-border/50 bg-muted/10">
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() =>
                router.push(
                  `/project/${params.id}/units?filter=full_property`
                )
              }
              className={`h-12 px-1 rounded-xl border-2 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${filter === "full_property" ? "bg-primary/80 text-primary-foreground shadow-lg border-primary" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"}`}
            >
              Propiedad Completa
            </button>
            <button
              onClick={() =>
                router.push(
                  `/project/${params.id}/units?filter=tokenized`
                )
              }
              className={`h-12 px-1 rounded-xl border-2 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${filter === "tokenized" ? "bg-primary/80 text-primary-foreground shadow-lg border-primary" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"}`}
            >
              Tokens Lanzamiento
            </button>
            <button
              onClick={() =>
                router.push(
                  `/project/${params.id}/units?filter=fixed_rent`
                )
              }
              className={`h-12 px-1 rounded-xl border-2 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${filter === "fixed_rent" ? "bg-primary/80 text-primary-foreground shadow-lg border-primary" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"}`}
            >
              Renta Fija
            </button>
          </div>
        </div>
      </div>

      {/* Units List */}
      <main className="flex-1 p-4 space-y-4">
        {filteredUnits.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Info className="mx-auto mb-4 w-12 h-12 opacity-20" />
            <p>
              No hay unidades
              disponibles en esta
              categoría.
            </p>
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const isSoldOut =
              unit.statusRaw ===
              "sold_out";
            const isUpcoming =
              unit.statusRaw ===
              "upcoming";
            const isAvailable =
              unit.statusRaw ===
              "available";

            return (
              <div
                key={unit.id}
                id={`unit-${unit.id}`}
                onClick={() =>
                  !isUpcoming &&
                  setSelectedUnitId(
                    unit.id
                  )
                }
                className={`flex flex-col p-4 rounded-[28px] transition-all cursor-pointer border ${
                  selectedUnitId ===
                  unit.id
                    ? "bg-white border-primary shadow-xl scale-[1.02] z-10 relative"
                    : isUpcoming
                      ? "bg-muted/10 border-border/20 opacity-60 cursor-not-allowed"
                      : "bg-card border-border/40 hover:border-primary/30 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex gap-4 items-center">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                        selectedUnitId ===
                        unit.id
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-muted/30 text-[#3B2146] border border-border/50"
                      }`}
                    >
                      {isUpcoming ? (
                        <Lock className="w-6 h-6 opacity-50" />
                      ) : (
                        unit.floor +
                        unit.type.charAt(
                          0
                        )
                      )}
                    </div>
                    <div>
                      <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight">
                        {unit.type} •
                        Piso{" "}
                        {unit.floor}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">
                        {unit.isTokenized
                          ? unit.tokenName ||
                            "Tokenizado"
                          : "Venta tradicional"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[17px] font-black text-[#3B2146] leading-tight">
                      {unit.price}
                    </div>
                    <div
                      className={`text-[10px] font-black uppercase mt-1 ${
                        isAvailable
                          ? "text-brand-green"
                          : isSoldOut
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {unit.status}
                    </div>
                  </div>
                </div>

                {unit.isTokenized &&
                  !isUpcoming && (
                    <div className="flex gap-6 items-end mt-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black text-primary">
                            {unit.tokensSold ??
                              0}{" "}
                            /{" "}
                            {unit.totalTokens ??
                              0}
                            <span className="text-muted-foreground text-[9px] font-bold ml-1 uppercase">
                              Tokens
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-1000 bg-primary"
                            style={{
                              width: `${
                                ((unit.tokensSold ??
                                  0) /
                                  (unit.totalTokens ??
                                    1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Only show 'Buy' button area if available */}
                      {isAvailable && (
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                            {filter ===
                            "fixed_rent"
                              ? "Disponible"
                              : "Tokens"}
                          </span>
                          <div className="bg-linear-to-r from-brand-lime via-brand-green to-brand-teal text-white py-1.5 px-3 rounded-full shadow-md shadow-brand-green/20 flex items-center gap-1.5">
                            <span className="text-[13px] font-black leading-none">
                              $
                              {(
                                ((unit.totalTokens ??
                                  0) -
                                  (unit.tokensSold ??
                                    0)) *
                                (100 /
                                  1000)
                              ).toFixed(
                                0
                              )}
                              K
                            </span>
                            <span className="text-[8px] font-black leading-none opacity-80 uppercase tracking-tighter">
                              USDT
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            );
          })
        )}
      </main>

      {/* Action Footer */}
      {selectedUnit && (
        <div
          className={`fixed z-[60] animate-in slide-in-from-bottom-full duration-300 ${
            isDetailsOpen
              ? "inset-0 p-4 backdrop-blur-sm bg-background/80"
              : "right-0 bottom-0 left-0 p-4"
          }`}
        >
          <div
            className={`bg-card/95 backdrop-blur-2xl border border-primary/20 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.3)] overflow-hidden relative flex flex-col transition-all duration-500 ${
              isDetailsOpen
                ? "h-full w-full rounded-[32px] p-6"
                : "rounded-[32px] p-6"
            }`}
          >
            <button
              onClick={() => {
                setSelectedUnitId(null);
                setIsDetailsOpen(false);
              }}
              className="flex absolute top-6 right-6 z-20 justify-center items-center w-8 h-8 rounded-full shadow-md transition-colors bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full blur-3xl bg-primary/5" />

            <div className="flex flex-col gap-6 h-full">
              <div className="flex flex-col gap-4 shrink-0">
                <div className="flex gap-4 items-center pr-12">
                  <div className="flex justify-center items-center w-14 h-14 text-lg font-black text-white rounded-2xl shadow-lg shrink-0 bg-primary shadow-primary/30">
                    {selectedUnit.floor +
                      selectedUnit.type.charAt(
                        0
                      )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#3B2146] leading-tight">
                      {
                        selectedUnit.type
                      }{" "}
                      • Piso{" "}
                      {
                        selectedUnit.floor
                      }
                    </h3>
                    <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">
                      {selectedUnit.isTokenized
                        ? selectedUnit.tokenName ||
                          "Tokenizado"
                        : "Venta tradicional"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    <span className="flex gap-1 items-center">
                      <Layers className="w-3 h-3" />{" "}
                      {
                        selectedUnit.type
                      }
                    </span>
                    <span className="flex gap-1 items-center">
                      <Maximize2 className="w-3 h-3" />{" "}
                      {
                        selectedUnit.area
                      }
                    </span>
                    <span className="flex gap-1 items-center">
                      <MapPin className="w-3 h-3" />{" "}
                      Vista{" "}
                      {
                        selectedUnit.orientation
                      }
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-foreground">
                      {
                        selectedUnit.price
                      }
                    </div>
                    {selectedUnit.isTokenized && (
                      <div className="text-[10px] font-black text-primary uppercase tracking-tighter">
                        o{" "}
                        {
                          selectedUnit.totalTokens
                        }{" "}
                        Tokens
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isDetailsOpen && (
                <div className="overflow-hidden flex-1 px-6 -mx-6">
                  <Tabs
                    defaultValue="plano"
                    className="flex flex-col w-full h-full"
                  >
                    <TabsList className="grid grid-cols-2 p-1 mb-4 w-full rounded-xl border bg-primary/5 border-primary/10">
                      <TabsTrigger
                        value="plano"
                        className="rounded-lg text-[10px] font-black uppercase tracking-widest bg-transparent text-primary/60 data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
                      >
                        Plano
                      </TabsTrigger>
                      <TabsTrigger
                        value="caracteristicas"
                        className="rounded-lg text-[10px] font-black uppercase tracking-widest bg-transparent text-primary/60 data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary"
                      >
                        Características
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="plano"
                      className="overflow-y-auto flex-1 mt-0 h-full"
                    >
                      <div className="overflow-hidden relative w-full h-64 rounded-2xl bg-muted shrink-0">
                        <Image
                          src="/building_floor_layout.png"
                          fill
                          className="object-contain bg-white"
                          alt="Plano"
                        />
                        <div className="absolute inset-0 to-transparent bg-linear-to-t from-black/60" />
                        <div className="absolute bottom-4 left-6 text-white">
                          <h2 className="text-xl font-black uppercase">
                            Plano
                            Arquitectónico
                          </h2>
                          <p className="text-xs font-medium text-white/80">
                            {
                              selectedUnit.id
                            }{" "}
                            •{" "}
                            {
                              selectedUnit.type
                            }
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="caracteristicas"
                      className="overflow-y-auto flex-1 mt-0"
                    >
                      <div className="space-y-3">
                        <h4 className="text-xs font-black tracking-widest uppercase text-primary">
                          Especificaciones
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Pisos de porcelanato italiano",
                            "Grifería Hansgrohe de alta gama",
                            "Balcón aterrazado con deck de madera",
                            "Calefacción por losa radiante individual",
                          ].map(
                            (
                              item,
                              i
                            ) => (
                              <div
                                key={i}
                                className="flex gap-2 items-center text-xs font-medium text-muted-foreground"
                              >
                                <CheckCircle2 className="w-3 h-3 text-brand-green shrink-0" />
                                {item}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <div
                className={`flex gap-3 shrink-0 ${
                  isDetailsOpen
                    ? "justify-center pt-4 border-t border-border/50"
                    : ""}`}
              >
                {!isDetailsOpen && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setIsDetailsOpen(
                        true
                      )
                    }
                    className="flex-1 h-14 text-xs font-black tracking-widest uppercase rounded-2xl border-border/50 hover:bg-muted"
                  >
                    <Info className="mr-2 w-4 h-4" />{" "}
                    Ver Detalles
                  </Button>
                )}
                <Button
                  className={`${
                    isDetailsOpen
                      ? "w-full max-w-sm"
                      : "flex-[1.5]"
                  } h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 font-black uppercase tracking-widest text-xs`}
                >
                  Invertir Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
