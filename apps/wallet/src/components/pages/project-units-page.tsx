"use client";

import { getProjectUnits } from "@/lib/api-client";

import { UnitDetailsDialog } from "../unit-details-dialog";
import { UnitDetailsActions } from "../unit-details-actions";
import {
  useState,
  useMemo,
  useEffect,
} from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  ArrowLeft,
  Layers,
  MapPin,
  Maximize2,
  Building2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import type { ProjectUnit } from "@/types/wallet";

export interface ProjectUnitsPageProps {
  projectId: string;
  units?: ProjectUnit[];
  filter?: string;
}

export default function ProjectUnitsPage({
  projectId,
  units,
  filter,
}: ProjectUnitsPageProps) {
  const router = useRouter();
  const [unitsState, setUnitsState] =
    useState<ProjectUnit[] | null>(
      units ?? null
    );
  const [loading, setLoading] =
    useState(units == null);
  const [error, setError] = useState<
    string | null
  >(null);
  const [
    selectedUnitId,
    setSelectedUnitId,
  ] = useState<string | null>(null);
  const [
    isContactDialogOpen,
    setIsContactDialogOpen,
  ] = useState(false);
  const [contactForm, setContactForm] =
    useState({
      name: "",
      phone: "",
      email: "",
      preference: "whatsapp", // whatsapp, call, telegram
    });

  useEffect(() => {
    if (units) {
      setUnitsState(units);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUnits() {
      try {
        setLoading(true);
        setError(null);

        const fetchedUnits = await getProjectUnits(projectId);

        if (!cancelled) {
          setUnitsState(fetchedUnits);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load units"
          );
          setUnitsState([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUnits();

    return () => {
      cancelled = true;
    };
  }, [projectId, units]);

  const filteredUnits = useMemo(() => {
    const allUnits = unitsState ?? [];
    return allUnits
      .filter((unit) => {
        const investmentType =
          unit.investmentType ?? "";

        if (
          filter === "full_property"
        ) {
          return (
            unit.isTokenized !== true &&
            investmentType ===
              "full_property"
          );
        }
        if (filter === "tokenized") {
          return (
            unit.isTokenized === true &&
            investmentType ===
              "appreciation"
          );
        }
        if (filter === "fixed_rent") {
          return (
            unit.isTokenized === true &&
            investmentType ===
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
  }, [unitsState, filter]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-muted-foreground">
          Loading units...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-destructive">
          {error}
        </div>
      </div>
    );
  }

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

  const handleFilterClick = (
    newFilter: string
  ) => {
    router.push(
      `/project/${projectId}/units?filter=${newFilter}`
    );
  };

  const handleUnitClick = (
    unitId: string
  ) => {
    setSelectedUnitId(unitId);
  };

  const handleBackClick = () => {
    router.back();
  };

  const statusMeta = (
    unit: ProjectUnit
  ) => {
    const statusRaw =
      unit.statusRaw ?? "";
    if (statusRaw === "available") {
      return {
        label: "Disponible",
        badgeClassName:
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        isLocked: false,
      };
    }
    if (statusRaw === "sold_out") {
      return {
        label: "Vendido",
        badgeClassName:
          "bg-muted text-muted-foreground border-border",
        isLocked: true,
      };
    }
    if (statusRaw === "upcoming") {
      return {
        label: "Próximamente",
        badgeClassName:
          "bg-blue-500/10 text-blue-600 border-blue-500/20",
        isLocked: true,
      };
    }
    if (statusRaw === "blocked") {
      return {
        label: "Bloqueado",
        badgeClassName:
          "bg-amber-500/10 text-amber-600 border-amber-500/20",
        isLocked: true,
      };
    }

    return {
      label: unit.status,
      badgeClassName:
        "bg-muted text-muted-foreground border-border",
      isLocked: true,
    };
  };

  const getTokenProgress = (
    unit: ProjectUnit
  ) => {
    const total = unit.totalTokens ?? 0;
    const sold = unit.tokensSold ?? 0;
    if (!total) {
      return {
        sold: 0,
        total: 0,
        pct: 0,
      };
    }
    const pct = Math.max(
      0,
      Math.min(
        100,
        (sold / total) * 100
      )
    );
    return { sold, total, pct };
  };

  const parsePriceToNumber = (
    price?: string
  ): number => {
    if (!price) return 0;
    const n = Number(
      price.replace(/[^\d.-]/g, "")
    );
    return Number.isFinite(n) ? n : 0;
  };

  const formatCompactUsd = (
    amount: number
  ): string => {
    const abs = Math.abs(amount);
    if (abs >= 1000) {
      return `$${Math.round(amount / 1000)}K`;
    }
    return `$${Math.round(amount)}`;
  };

  const getAmbCount = (
    unit: ProjectUnit
  ): number => {
    const first = String(
      unit.type ?? ""
    )
      .trim()
      .split(/\s+/)[0];
    const n = Number.parseInt(
      first,
      10
    );
    return Number.isFinite(n) ? n : 0;
  };

  const getUnitBadgeNumber = (
    unit: ProjectUnit
  ): string => {
    const floor = Number.parseInt(
      String(unit.floor ?? ""),
      10
    );
    const amb = getAmbCount(unit);
    if (
      Number.isFinite(floor) &&
      floor > 0 &&
      amb > 0
    ) {
      return `${floor}${amb}`;
    }
    return "";
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
              onClick={handleBackClick}
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
                handleFilterClick(
                  "full_property"
                )
              }
              className={`h-12 px-1 rounded-xl border-2 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${filter === "full_property" ? "bg-primary/80 text-primary-foreground shadow-lg border-primary" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"}`}
            >
              Propiedad Completa
            </button>
            <button
              onClick={() =>
                handleFilterClick(
                  "tokenized"
                )
              }
              className={`h-12 px-1 rounded-xl border-2 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${filter === "tokenized" ? "bg-primary/80 text-primary-foreground shadow-lg border-primary" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"}`}
            >
              Tokens Lanzamiento
            </button>
            <button
              onClick={() =>
                handleFilterClick(
                  "fixed_rent"
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
          <div className="pt-10 text-sm text-center text-muted-foreground">
            No hay unidades para este
            filtro.
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const meta =
              statusMeta(unit);
            const tokenProgress =
              getTokenProgress(unit);
            const isToken =
              unit.isTokenized === true;
            const badgeNumber =
              getUnitBadgeNumber(unit);
            const tokenLabel = String(
              unit.tokenSymbol ??
                unit.tokenName ??
                ""
            ).trim();
            const badgeLabel = isToken
              ? badgeNumber
              : String(
                  unit.unitCode ?? ""
                ).trim();
            const statusTextClassName =
              unit.statusRaw ===
              "available"
                ? "text-primary"
                : "text-muted-foreground";

            return (
              <Card
                key={unit.id}
                id={`unit-${unit.id}`}
                className={`overflow-hidden rounded-[28px] bg-white border border-border/40 shadow-sm transition-all ${
                  meta.isLocked
                    ? "opacity-90"
                    : "hover:shadow-md"
                }`}
                onClick={() =>
                  handleUnitClick(
                    unit.id
                  )
                }
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-4 justify-between items-center">
                      <div className="flex gap-4 items-center min-w-0">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg bg-muted/30 text-[#3B2146] border border-border/50 shrink-0">
                          {badgeLabel}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-[15px] uppercase text-[#3B2146] leading-tight truncate">
                            {String(
                              unit.type ??
                                ""
                            ).toUpperCase()}{" "}
                            • PISO{" "}
                            {unit.floor}
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5 truncate">
                            {isToken
                              ? tokenLabel
                              : "Venta tradicional no tokenizada"}
                          </div>
                        </div>
                      </div>

                      {isToken &&
                      unit.negotiatedAmount ? (
                        <div className="flex flex-col items-center mx-2 min-w-max">
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                            Tokens en
                            venta
                          </span>
                          <div className="w-full h-7 bg-linear-to-r from-brand-lime via-brand-green to-brand-teal text-white px-3 rounded-full shadow-md shadow-brand-green/20 flex items-center justify-center gap-1">
                            <span className="text-[14px] font-black leading-none">
                              {
                                unit.negotiatedAmount
                              }
                            </span>
                            <span className="text-[8px] font-black leading-none opacity-80 uppercase tracking-tighter">
                              USDT
                            </span>
                          </div>
                        </div>
                      ) : null}

                      <div className="text-right shrink-0">
                        <div className="text-[17px] font-black text-[#3B2146] leading-tight">
                          {unit.price}
                        </div>
                        {unit.statusRaw ===
                        "available" ? null : (
                          <div
                            className={`mt-1 font-black uppercase text-[10px] ${statusTextClassName}`}
                          >
                            {String(
                              meta.label ??
                                ""
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {isToken &&
                    tokenProgress.total >
                      0 ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-4 justify-between items-end">
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="text-[11px] font-black text-primary">
                              {
                                tokenProgress.sold
                              }{" "}
                              /{" "}
                              {
                                tokenProgress.total
                              }
                              <span className="text-muted-foreground text-[9px] font-bold ml-1">
                                TOKENS
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-1000 bg-primary"
                                style={{
                                  width: `${tokenProgress.pct}%`,
                                }}
                              />
                            </div>
                          </div>

                          {unit.statusRaw ===
                          "available"
                            ? (() => {
                                const tokensRemaining =
                                  Math.max(
                                    0,
                                    tokenProgress.total -
                                      tokenProgress.sold
                                  );
                                const unitPriceNum =
                                  parsePriceToNumber(
                                    unit.price
                                  );
                                const tokenUnitPrice =
                                  tokenProgress.total >
                                    0 &&
                                  unitPriceNum >
                                    0
                                    ? unitPriceNum /
                                      tokenProgress.total
                                    : 0;
                                const remainingValueUsd =
                                  tokensRemaining *
                                  tokenUnitPrice;

                                if (
                                  !remainingValueUsd
                                )
                                  return null;

                                return (
                                  <div className="flex flex-col gap-1 items-center min-w-max shrink-0">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center">
                                      TOKENS
                                    </div>
                                    <div className="h-7 px-3 rounded-full bg-linear-to-r from-brand-lime via-brand-green to-brand-teal text-white flex items-center gap-1.5 shadow-md shadow-brand-green/20">
                                      <span className="text-[14px] font-black leading-none">
                                        {formatCompactUsd(
                                          remainingValueUsd
                                        )}
                                      </span>
                                      <span className="text-[8px] font-black leading-none opacity-80 uppercase tracking-tighter">
                                        USDT
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()
                            : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      <UnitDetailsDialog
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnitId(null)}
        data={selectedUnit || null}
        onInvest={(unit) => {
          const u = unit as ProjectUnit;
          if (u.isTokenized && u.tokenSymbol) {
            router.push(`/exchange/${u.tokenSymbol}`);
            return;
          }
          setIsContactDialogOpen(true);
        }}
      />

      {/* Contact Dialog */}
      <Dialog
        open={isContactDialogOpen}
        onOpenChange={
          setIsContactDialogOpen
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Contactar Asesor
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsContactDialogOpen(
                false
              );
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="contact-name">
                Nombre
              </Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm(
                    (prev) => ({
                      ...prev,
                      name: e.target
                        .value,
                    })
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">
                Teléfono
              </Label>
              <Input
                id="contact-phone"
                value={
                  contactForm.phone
                }
                onChange={(e) =>
                  setContactForm(
                    (prev) => ({
                      ...prev,
                      phone:
                        e.target.value,
                    })
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">
                Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={
                  contactForm.email
                }
                onChange={(e) =>
                  setContactForm(
                    (prev) => ({
                      ...prev,
                      email:
                        e.target.value,
                    })
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-preference">
                Preferencia
              </Label>
              <select
                id="contact-preference"
                className="px-3 py-2 w-full text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={
                  contactForm.preference
                }
                onChange={(e) =>
                  setContactForm(
                    (prev) => ({
                      ...prev,
                      preference:
                        e.target.value,
                    })
                  )
                }
              >
                <option value="whatsapp">
                  WhatsApp
                </option>
                <option value="call">
                  Llamada
                </option>
                <option value="telegram">
                  Telegram
                </option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Enviar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
