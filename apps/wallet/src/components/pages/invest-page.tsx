"use client";

import {
  useState,
  useMemo,
} from "react";
import { useProjects } from "@/hooks/use-queries";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  Building2,
  ArrowRight,
  LucideIcon,
  Hammer,
  Key,
  Clock,
  Search,
  SlidersHorizontal,
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
  status:
    | "PRE-VENTA"
    | "EN CONSTRUCCION"
    | "COMPLETADO";
  roi: string;
  progress: number;
  precioRange?: string;
  rentaFija?: string;
  tokensTotal?: string;
  launchDate?: string;
  nextLaunchDate?: string;
}

type ProjectStatusUi =
  | "PRE-VENTA"
  | "EN CONSTRUCCION"
  | "COMPLETADO";

export default function InvestPage() {
  const { data: fetchedProjects = [] } =
    useProjects();
  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const categories: Category[] = [
    {
      id: "all",
      label: "Todos",
      icon: Building2,
      color:
        "bg-primary text-primary-foreground",
    },
    {
      id: "PRE-VENTA",
      label: "Lanzamientos",
      icon: Clock,
      color:
        "bg-blue-500/10 text-blue-600",
    },
    {
      id: "EN CONSTRUCCION",
      label: "En obra",
      icon: Hammer,
      color:
        "bg-amber-500/10 text-amber-600",
    },
    {
      id: "COMPLETADO",
      label: "Completados",
      icon: Key,
      color:
        "bg-purple-500/10 text-purple-600",
    },
  ];

  const projects = useMemo(() => {
    return fetchedProjects.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      image: p.image,
      status: (p.status === "PRE_SALE"
        ? "PRE-VENTA"
        : p.status === "IN_CONSTRUCTION"
          ? "EN CONSTRUCCION"
          : "COMPLETADO") as ProjectStatusUi,
      roi: `${p.roiPct}%`,
      progress: p.progressPct,
      precioRange: p.priceRangeUsd,
      rentaFija: p.fixedRentPct
        ? `${p.fixedRentPct}%`
        : undefined,
      tokensTotal: p.tokensTotal
        ? `$${p.tokensTotal.toLocaleString()}`
        : undefined,
      launchDate: p.launchDate,
      nextLaunchDate: p.nextLaunchDate,
    }));
  }, [fetchedProjects]);

  const filteredProjects =
    useMemo(() => {
      return selectedCategory === "all"
        ? projects
        : projects.filter(
            (p) =>
              p.status ===
              selectedCategory
          );
    }, [selectedCategory, projects]);

  return (
    <div className="overflow-x-hidden p-4 pb-32 mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Oportunidades
          </h1>
          <p className="text-xs text-muted-foreground">
            Explorá los mejores
            proyectos inmobiliarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-sm bg-card border-muted/20"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-sm bg-card border-muted/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Categories Grid Selection */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(
                cat.id
              )
            }
            className={cn(
              "flex items-center w-full min-w-0 gap-2 px-3 py-3 rounded-2xl text-[12px] font-black transition-all border shadow-sm relative overflow-hidden group sm:gap-3 sm:px-4 sm:py-4 sm:text-[13px]",
              selectedCategory ===
                cat.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.05] z-10"
                : "bg-card border-muted/20 text-muted-foreground hover:border-muted-foreground/30 hover:scale-[1.02]"
            )}
          >
            <cat.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110 sm:h-5 sm:w-5",
                selectedCategory ===
                  cat.id
                  ? "text-white"
                  : "text-primary/60"
              )}
            />
            <span className="min-w-0 leading-tight line-clamp-2 sm:line-clamp-1">
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Modern Grid Layout */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="flex gap-2 items-center font-bold">
            Todos los activos
            <Badge
              variant="secondary"
              className="bg-primary/5 text-[10px] text-primary border-none"
            >
              {projects.length}{" "}
              resultados
            </Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map(
            (project) => (
              <Link
                href={`/project/${project.id}`}
                key={project.id}
              >
                <Card className="overflow-hidden border-none shadow-md group bg-card transition-all hover:scale-[1.02] flex flex-col h-full">
                  <div className="relative h-32 shrink-0">
                    <Image
                      src={
                        project.image
                      }
                      alt={
                        project.title
                      }
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 via-transparent to-transparent bg-linear-to-t from-black/60" />

                    {/* Status Badge */}
                    <div
                      className={cn(
                        "absolute top-2 right-2 text-[8px] uppercase font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm text-white flex flex-col items-center gap-1",
                        project.status ===
                          "PRE-VENTA"
                          ? "bg-accent"
                          : "bg-black/40"
                      )}
                    >
                      {project.status}
                      {project.status ===
                        "EN CONSTRUCCION" && (
                        <div className="w-full bg-white/20 h-0.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-1000"
                            style={{
                              width: `${project.progress}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Image Legend */}
                    {project.status ===
                      "PRE-VENTA" &&
                      project.launchDate && (
                        <div className="absolute right-0 bottom-0 left-0 px-3 py-1 border-t backdrop-blur-md translate-y-px bg-black/40 border-white/10">
                          <div className="flex flex-col items-center">
                            <span className="text-[7px] font-bold text-white text-center uppercase tracking-wide opacity-90">
                              Lanzamiento
                            </span>
                            <span className="text-[9px] font-black text-white text-center uppercase tracking-wide">
                              {
                                project.launchDate
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    {project.status ===
                      "EN CONSTRUCCION" &&
                      project.nextLaunchDate && (
                        <div className="absolute right-0 bottom-0 left-0 px-3 py-1 border-t backdrop-blur-md translate-y-px bg-black/40 border-white/10">
                          <div className="flex flex-col items-center">
                            <span className="text-[7px] font-bold text-white text-center uppercase tracking-wide opacity-90">
                              Próximo
                              Lanzamiento
                            </span>
                            <span className="text-[9px] font-black text-white text-center uppercase tracking-wide">
                              {
                                project.nextLaunchDate
                              }
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                  <CardContent className="flex flex-col flex-1 gap-3 p-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-[11px] line-clamp-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex gap-1 justify-between items-center">
                        <p className="text-[9px] text-muted-foreground flex items-center truncate">
                          <Building2 className="h-2.5 w-2.5 mr-1 shrink-0" />{" "}
                          {
                            project.location.split(
                              ","
                            )[0]
                          }
                        </p>
                        <span className="text-[9px] font-bold text-primary whitespace-nowrap">
                          ROI ~
                          {project.roi}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="overflow-hidden w-full h-1 rounded-full bg-secondary">
                        <div
                          className="h-full transition-all duration-1000 bg-primary"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-center gap-1.5">
                        {project.precioRange && (
                          <div className="bg-secondary/40 rounded-xl p-2 w-[32%] shrink-0 border border-muted/5 flex flex-col items-center justify-center">
                            <p className="text-[7px] text-muted-foreground font-extrabold uppercase tracking-wider mb-0.5 truncate">
                              Desde
                            </p>
                            <p className="text-[9px] font-black text-foreground truncate">
                              {
                                project.precioRange.split(
                                  " "
                                )[0]
                              }
                            </p>
                          </div>
                        )}
                        {project.tokensTotal &&
                          project.tokensTotal !==
                            "$0" && (
                            <div className="bg-primary/10 rounded-xl p-2 w-[32%] shrink-0 border border-primary/10 flex flex-col items-center justify-center">
                              <p className="text-[7px] text-primary/60 font-extrabold uppercase tracking-wider mb-0.5 truncate">
                                Tokens
                              </p>
                              <p className="text-[9px] font-black text-primary truncate">
                                {
                                  project.tokensTotal
                                }
                              </p>
                            </div>
                          )}
                        {project.rentaFija && (
                          <div className="bg-primary/5 rounded-xl p-2 w-[32%] shrink-0 border border-muted/5 flex flex-col items-center justify-center">
                            <p className="text-[7px] text-muted-foreground font-extrabold uppercase tracking-wider mb-0.5 truncate">
                              Renta
                            </p>
                            <p className="text-[9px] font-black text-foreground truncate">
                              {
                                project.rentaFija
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Global Stats / Tokens Summary */}
      <div className="flex justify-between items-center p-4 rounded-2xl border shadow-sm bg-card border-muted/20">
        <div className="flex gap-3 items-center">
          <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              Total Tokens en venta
            </p>
            <p className="text-xl font-black text-primary">
              $4.650.000
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground font-medium">
            6 Proyectos activos
          </p>
          <div className="flex gap-1 justify-end mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
          </div>
        </div>
      </div>

      {/* Exchange Banner */}
      <Card className="overflow-hidden relative bg-primary/5 border-primary/10">
        <div className="flex gap-4 justify-between items-center p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold">
              ¿Buscás el Mercado
              Secundario?
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Comprá y vendé tokens de
              otros usuarios en tiempo
              real.
            </p>
          </div>
          <Button
            size="sm"
            className="px-4 h-9 text-xs font-bold rounded-xl"
            asChild
          >
            <Link href="/exchange">
              Ir al Exchange
              <ArrowRight className="ml-1 w-3 h-3" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
