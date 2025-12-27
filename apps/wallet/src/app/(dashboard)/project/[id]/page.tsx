import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Layers,
  Home,
  Maximize2,
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Wallet,
  Building2,
  ArrowUpRight,
  Heart,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  ProjectStories,
  SimilarProjectsCarousel,
} from "@/components/project/stories-section";

const STORIES = [
  {
    id: 1,
    title: "Exterior",
    image: "/projects/header-tower.png",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: 2,
    title: "Cocina",
    image: "/projects/kitchen.png",
    color: "from-orange-400 to-red-500",
  },
  {
    id: 3,
    title: "Amenities",
    image:
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800",
    color:
      "from-green-400 to-emerald-600",
  },
  {
    id: 4,
    title: "Vistas",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800",
    color:
      "from-purple-400 to-indigo-600",
  },
];

const STAGES = [
  {
    id: 1,
    name: "Etapa 1: Lanzamiento",
    date: "Marzo 2024",
    status: "active",
    units: 20,
    available: 5,
    minPrice: 100,
  },
  {
    id: 2,
    name: "Etapa 2: Pozo",
    date: "Septiembre 2024",
    status: "upcoming",
    units: 35,
    available: 35,
    minPrice: 110,
  },
];

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?:
    | { returnTo?: string }
    | Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams =
    await searchParams;
  const returnToRaw =
    resolvedSearchParams?.returnTo;
  const backHref =
    typeof returnToRaw === "string" &&
    returnToRaw.startsWith("/")
      ? returnToRaw
      : "/dashboard";

  // Sample similar projects for the carousel
  const SIMILAR_PROJECTS = [
    {
      id: "barrio-el-ceibo",
      title:
        'Barrio Privado "El Ceibo"',
      location: "Pilar, Buenos Aires",
      image:
        "/projects/barrio-el-ceibo.png",
      status: "PRE-VENTA",
      roi: 18,
      progress: 0,
      priceRange: "$100K",
      fixedRent: 18,
    },
    {
      id: "residencial-las-heras",
      title: "Residencial Las Heras",
      location: "Recoleta, BSAS",
      image:
        "/projects/torre-libertador.png",
      status: "EN CONSTRUCCION",
      roi: 18,
      progress: 85,
      priceRange: "$150K",
      fixedRent: 14,
    },
    {
      id: "oficinas-madero",
      title: "Oficinas Madero",
      location: "Puerto Madero, CABA",
      image:
        "/projects/barrio-el-ceibo.png",
      status: "COMPLETADO",
      roi: 10,
      progress: 100,
      priceRange: "$250K+",
      fixedRent: 8.5,
    },
  ];

  return (
    <div className="relative pb-32 min-h-screen bg-background">
      {/* Header Image */}
      <div className="h-[420px] relative w-full overflow-hidden">
        <Image
          src="/projects/header-tower.png"
          alt="Torre Libertador"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 to-transparent bg-linear-to-t from-background via-background/80" />

        <Link
          href={backHref}
          className="absolute top-4 left-4 z-10 p-2 text-white rounded-full border backdrop-blur-md transition-colors bg-background/30 hover:bg-background/50 border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <button className="absolute top-4 right-4 z-10 p-2 text-white rounded-full border backdrop-blur-md transition-colors bg-background/30 hover:bg-background/50 border-white/10 group">
          <Heart className="w-6 h-6 transition-all group-active:fill-red-500 group-active:text-red-500" />
        </button>

        <div className="absolute right-4 left-4 bottom-16 z-10">
          <div className="space-y-1">
            <Badge
              variant="pink"
              className="shadow-lg border-0 text-[10px] font-bold tracking-widest uppercase"
            >
              En Construcción
            </Badge>
            <h1 className="text-3xl font-bold drop-shadow-sm text-foreground">
              Torre Libertador 8000
            </h1>
            <div className="flex items-center text-sm font-medium text-foreground/80">
              <MapPin className="mr-1 w-4 h-4 text-primary" />{" "}
              Av. del Libertador 8000,
              Nuñez
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 px-4 -mt-12 space-y-8">
        {/* Gallery Stories & Action */}
        <div className="flex gap-4 items-start">
          <div className="overflow-x-auto flex-1 px-4 pb-2 pl-8 -mx-4 scrollbar-hide">
            <ProjectStories
              stories={STORIES}
            />
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="overflow-hidden shadow-sm backdrop-blur-md transition-colors border-border/50 bg-card/60 group hover:border-primary/50">
            <CardContent className="p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                ROI Est.
              </div>
              <div className="flex gap-1 justify-center items-center text-xl font-black text-brand-green">
                12.4%{" "}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden shadow-sm backdrop-blur-md transition-colors border-border/50 bg-card/60 group hover:border-primary/50">
            <CardContent className="p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                Plazo
              </div>
              <div className="text-xl font-black text-foreground">
                24 m
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden shadow-sm backdrop-blur-md transition-colors border-border/50 bg-card/60 group hover:border-primary/50">
            <CardContent className="p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                Liquidez
              </div>
              <div className="flex gap-1 justify-center items-center text-xl font-black text-brand-green">
                High
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIMILAR PROJECTS CAROUSEL */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-black tracking-tight">
              Oportunidades Destacadas
            </h3>
            <Link
              href="/invest"
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <SimilarProjectsCarousel
            projects={SIMILAR_PROJECTS}
            delay={4000}
          />
        </div>

        {/* EXCHANGE GATEWAY */}
        <Card className="bg-linear-to-br from-primary/10 via-background to-secondary/5 border-primary/20 shadow-xl overflow-hidden relative cursor-pointer group active:scale-[0.98] transition-all">
          <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <ShoppingBag className="w-48 h-48 -rotate-12" />
          </div>
          <CardContent className="relative z-10 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="flex gap-2 items-center text-xl font-black text-foreground">
                  <Wallet className="w-5 h-5 text-primary" />{" "}
                  Mercado Secundario
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Comprá o vendé tokens
                  de este proyecto ahora
                </p>
              </div>
              <Badge className="animate-pulse bg-brand-green/10 text-brand-green border-brand-green/20">
                Live
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  Precio de Mercado
                </span>
                <div className="text-2xl font-black text-foreground">
                  $114.20
                </div>
                <div className="text-[10px] text-brand-green font-bold">
                  +2.4% vs Lanzamiento
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  Tokens en Venta
                </span>
                <div className="text-2xl font-black text-foreground">
                  1,420
                </div>
                <div className="text-[10px] text-muted-foreground font-bold italic underline">
                  Ver todas las órdenes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN CONTENT TABS */}
        <Tabs
          defaultValue="stages"
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 p-1 w-full h-14 rounded-2xl border backdrop-blur-sm bg-muted/30 border-border/50">
            <TabsTrigger
              value="stages"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs font-bold uppercase tracking-wider"
            >
              Roadmap
            </TabsTrigger>
            <TabsTrigger
              value="financials"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs font-bold uppercase tracking-wider"
            >
              Finanzas
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs font-bold uppercase tracking-wider"
            >
              Proyecto
            </TabsTrigger>
          </TabsList>

          {/* STAGES TAB */}
          <TabsContent
            value="stages"
            className="mt-8 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="flex gap-2 items-center text-lg font-black">
                  <Layers className="w-5 h-5 text-primary" />{" "}
                  Fases de Construcción
                </h3>
              </div>

              {STAGES.map((stage) => (
                <Card
                  key={stage.id}
                  className={`overflow-hidden border-l-4 transition-all hover:shadow-lg ${stage.status === "active" ? "border-l-primary shadow-md ring-1 ring-primary/10" : "border-l-muted-foreground/20 opacity-70 bg-muted/10"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-black tracking-tight uppercase text-foreground">
                          {stage.name}
                        </h4>
                        <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          <Calendar className="mr-1 w-3 h-3 text-primary" />{" "}
                          Estimado:{" "}
                          {stage.date}
                        </div>
                      </div>
                      {stage.status ===
                      "active" ? (
                        <Badge className="font-bold shadow-lg bg-primary text-primary-foreground shadow-primary/20">
                          VENTA ABIERTA
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="font-bold text-muted-foreground"
                        >
                          PRÓXIMAMENTE
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="p-2 rounded-xl border bg-secondary/40 border-border/50">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">
                          Total Uni.
                        </span>
                        <span className="flex gap-1 items-center text-sm font-black">
                          <Home className="w-3 h-3 text-primary" />{" "}
                          {stage.units}
                        </span>
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${stage.status === "active" ? "bg-primary/5 border-primary/20" : "bg-secondary/40 border-border/50"}`}
                      >
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">
                          Disponibles
                        </span>
                        <span className="text-sm font-black text-primary">
                          {
                            stage.available
                          }
                        </span>
                      </div>
                      <div className="p-2 rounded-xl border bg-secondary/40 border-border/50">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">
                          Min. Entry
                        </span>
                        <span className="text-sm font-black text-foreground">
                          $
                          {
                            stage.minPrice
                          }
                        </span>
                      </div>
                    </div>

                    {stage.status ===
                      "active" && (
                      <Link
                        href={`/project/${id}/units`}
                        className="block w-full"
                      >
                        <Button
                          className="w-full h-10 text-xs font-bold tracking-widest uppercase group"
                          variant="secondary"
                        >
                          Explorar
                          Unidades{" "}
                          <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* PROJECT MAP OVERVIEW */}
              <div className="pt-4 space-y-4">
                <h4 className="text-sm font-black tracking-widest uppercase text-muted-foreground">
                  Mapa General del
                  Proyecto
                </h4>
                <Card className="overflow-hidden relative bg-white border-border/50 group">
                  <Image
                    src="/building_floor_layout.png"
                    alt="Site Plan"
                    width={400}
                    height={300}
                    className="object-contain w-full h-auto opacity-90 transition-opacity group-hover:opacity-100"
                  />
                  <div className="flex absolute inset-0 justify-center items-end pb-6 via-transparent to-transparent opacity-0 transition-opacity bg-linear-to-t from-background/80 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="font-bold shadow-xl"
                    >
                      <Maximize2 className="mr-2 w-4 h-4" />{" "}
                      Ampliar Mapa
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FINANCIALS TAB */}
          <TabsContent
            value="financials"
            className="mt-8 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm bg-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-1">
                  <TrendingUp className="mb-2 w-5 h-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    TIR Proyectada
                  </span>
                  <div className="text-2xl font-black text-brand-green">
                    12.4%
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm bg-secondary/20 border-border/50">
                <CardContent className="p-4 space-y-1">
                  <DollarSign className="mb-2 w-5 h-5 text-brand-green" />
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    VAN (NPV)
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    $2.8M
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="flex gap-2 items-center text-lg font-black">
                <BarChart3 className="w-5 h-5 text-primary" />{" "}
                Flujo de Fondos
                Proyectado
              </h4>
              <Card className="p-4 border-2 border-dashed bg-muted/10 border-border/50">
                <div className="space-y-6">
                  {[
                    {
                      label:
                        "Construcción",
                      progress: 100,
                      val: "$1.4M",
                      color:
                        "bg-primary",
                    },
                    {
                      label:
                        "Marketing/Ventas",
                      progress: 45,
                      val: "$0.6M",
                      color:
                        "bg-orange-500",
                    },
                    {
                      label:
                        "Reservas/Legal",
                      progress: 80,
                      val: "$0.2M",
                      color:
                        "bg-brand-green",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                        <span>
                          {item.label}
                        </span>
                        <span className="text-muted-foreground">
                          {item.val}
                        </span>
                      </div>
                      <div className="overflow-hidden w-full h-2 rounded-full bg-secondary">
                        <div
                          className={`${item.color} h-full rounded-full transition-all`}
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="pt-2 space-y-4">
              <h4 className="flex gap-2 items-center text-lg font-black">
                <PieChart className="w-5 h-5 text-primary" />{" "}
                Programa de Dividendos
              </h4>
              <div className="space-y-3">
                {[
                  {
                    date: "Dic 2024",
                    event:
                      "Inicio de Rentas",
                    type: "Distribución",
                  },
                  {
                    date: "Jun 2025",
                    event:
                      "Finalización Obra",
                    type: "Appreciation",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 rounded-2xl border bg-muted/20 border-border/50"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-2 rounded-xl border bg-background border-border/50 text-primary">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black">
                          {item.event}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {item.date}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-black uppercase"
                    >
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* PROJECT OVERVIEW TAB */}
          <TabsContent
            value="overview"
            className="mt-8 space-y-8 animate-in fade-in-50 slide-in-from-bottom-4"
          >
            <div className="space-y-4">
              <h3 className="flex gap-2 items-center text-xl font-black tracking-tight">
                <Building2 className="w-5 h-5 text-primary" />{" "}
                Desarrollado por
                RealInvest
              </h3>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                Torre Libertador 8000
                redefine el skyline de
                Nuñez. Un desarrollo
                premium de 20 pisos que
                combina arquitectura
                vanguardista con
                sustentabilidad.
                Unidades de 2, 3 y 4
                ambientes con
                terminaciones de
                categoría AAA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  Arquitecto
                </span>
                <div className="text-sm font-black uppercase">
                  Pelli Clarke Pelli
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  Entrega
                </span>
                <div className="text-sm font-black uppercase">
                  Dic 2025
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-border/50">
              <h3 className="text-lg font-black tracking-widest uppercase text-primary">
                Amenities High-End
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Piscina de Borde Infinito • Piso 21",
                  "Sky Gym con vista al Río",
                  "Work & Lounge Oasis",
                  "Seguridad Presencial 24/7",
                  "Rooftop Lounge & Mixology Bar",
                  "Cava Privada de Vinos",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center p-3 rounded-2xl border transition-colors bg-secondary/20 border-border/50 group hover:border-primary/50"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    <span className="text-xs font-black tracking-tight uppercase text-foreground/80">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
