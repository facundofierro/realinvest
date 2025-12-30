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
import { useRouter } from "next/navigation";
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
    isDetailsOpen,
    setIsDetailsOpen,
  ] = useState(false);
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

        const response = await fetch(
          `/api/projects/${projectId}/units`
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch project units"
          );
        }
        const json = (await response
          .json()
          .catch(() => null)) as {
          units?: ProjectUnit[];
        } | null;

        const fetchedUnits =
          Array.isArray(json?.units)
            ? json?.units
            : [];

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
    setIsDetailsOpen(true);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleContactClick = () => {
    setIsContactDialogOpen(true);
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
        {/* Unit cards would be rendered here */}
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            id={`unit-${unit.id}`}
          >
            {/* Unit card content */}
          </div>
        ))}
      </main>

      {/* Unit Details Dialog */}
      <Dialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Detalles de la Unidad
            </DialogTitle>
          </DialogHeader>
          {selectedUnit && (
            <div className="space-y-4">
              {/* Unit details content */}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
          <div className="space-y-4">
            {/* Contact form content */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
