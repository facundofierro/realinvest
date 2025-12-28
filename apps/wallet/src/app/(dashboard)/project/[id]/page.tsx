"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
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
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
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
  DollarSign,
  Wallet,
  Building2,
  Heart,
  Hammer,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProjectStories } from "@/components/project/stories-section";

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

const PURCHASE_OPTIONS = [
  {
    key: "token_launch",
    title: "Lanzamiento",
    subtitle:
      "Tokens de propiedad en lanzamiento",
    headerIcon: Wallet,
    headerIconClassName:
      "text-brand-pink",
    watermarkIcon: ShoppingBag,
    cardClassName:
      "bg-white border-none",
    badgeText: "Nuevo",
    badgeClassName:
      "text-brand-pink bg-brand-pink/10 border-brand-pink/20",
    valueLabel: "Precio Inicial",
    value: "$100.00",
    actionText: "Reservar",
    getHref: (id: string) =>
      `/project/${id}/units?filter=tokenized`,
    actionClassName:
      "bg-brand-pink text-white hover:bg-brand-pink/90 border-transparent shadow-md shadow-brand-pink/20",
    iconContainerClassName:
      "bg-brand-pink/10 border-brand-pink/20 text-brand-pink",
  },
  {
    key: "fixed_rent",
    title: "Renta Fija",
    subtitle:
      "Tokens con renta fija garantizada",
    headerIcon: DollarSign,
    headerIconClassName:
      "text-emerald-500",
    watermarkIcon: TrendingUp,
    cardClassName:
      "bg-white border-none",
    badgeText: "Estable",
    badgeClassName:
      "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    valueLabel: "Retorno Anual",
    value: "12%",
    actionText: "Depositar",
    getHref: (id: string) =>
      `/project/${id}/units?filter=fixed_rent`,
    actionClassName:
      "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent shadow-md shadow-emerald-500/20",
    iconContainerClassName:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  {
    key: "full_property",
    title: "Propiedad Completa",
    subtitle:
      "Propiedad completa en lanzamiento",
    headerIcon: Building2,
    headerIconClassName:
      "text-purple-500",
    watermarkIcon: Home,
    cardClassName:
      "bg-white border-none",
    badgeText: "Exclusivo",
    badgeClassName:
      "text-purple-500 bg-purple-500/10 border-purple-500/20",
    valueLabel: "Desde",
    value: "$120,000",
    actionText: "Ver Planes",
    getHref: (id: string) =>
      `/project/${id}/units?filter=full_property`,
    actionClassName:
      "bg-purple-500 text-white hover:bg-purple-600 border-transparent shadow-md shadow-purple-500/20",
    iconContainerClassName:
      "bg-purple-500/10 border-purple-500/20 text-purple-500",
  },
  {
    key: "construction_tokens",
    title: "En Construcción",
    subtitle:
      "Tokens de propiedad en construcción",
    headerIcon: Hammer,
    headerIconClassName:
      "text-orange-500",
    watermarkIcon: Layers,
    cardClassName:
      "bg-white border-none",
    badgeText: "Oportunidad",
    badgeClassName:
      "text-orange-500 bg-orange-500/10 border-orange-500/20",
    valueLabel: "Plusvalía Est.",
    value: "15%",
    actionText: "Ver Tokens",
    getHref: (id: string) =>
      `/exchange?project=${id}`,
    actionClassName:
      "bg-orange-500 text-white hover:bg-orange-600 border-transparent shadow-md shadow-orange-500/20",
    iconContainerClassName:
      "bg-orange-500/10 border-orange-500/20 text-orange-500",
  },
] as const;

export default function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?:
    | { returnTo?: string }
    | Promise<{ returnTo?: string }>;
}) {
  const { id } = use(params);
  const resolvedSearchParams =
    searchParams instanceof Promise
      ? use(searchParams)
      : searchParams;
  const returnToRaw =
    resolvedSearchParams?.returnTo;
  const backHref =
    typeof returnToRaw === "string" &&
    returnToRaw.startsWith("/")
      ? returnToRaw
      : "/";
  const [isCollapsed, setIsCollapsed] =
    useState(false);
  const [showTitle, setShowTitle] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("stages");

  const [
    isStoryActive,
    setIsStoryActive,
  ] = useState(false);

  useEffect(() => {
    const handleStoryActive = (
      e: Event
    ) => {
      setIsStoryActive(
        (e as CustomEvent).detail
      );
    };

    window.addEventListener(
      "story-active",
      handleStoryActive
    );
    return () =>
      window.removeEventListener(
        "story-active",
        handleStoryActive
      );
  }, []);

  useEffect(() => {
    const threshold = 260;
    const onScroll = () => {
      const scrollY = window.scrollY;
      setIsCollapsed(
        scrollY > threshold
      );
      setShowTitle(scrollY > threshold);
    };

    onScroll();
    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );
    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

  return (
    <div className="relative pb-2 bg-background">
      <div
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${isCollapsed ? "border-b backdrop-blur-md bg-background/80 border-border/40" : "bg-transparent"}`}
      >
        <div
          className={`flex gap-3 items-center px-4 transition-all duration-300 ${isCollapsed ? "py-3" : "pt-4 pb-2"}`}
        >
          <Link
            href={backHref}
            className={`p-2 rounded-full border transition-colors ${isCollapsed ? "bg-muted/20 hover:bg-muted/40 border-border/50 text-foreground" : "text-white bg-background/30 hover:bg-background/50 border-white/10"}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div
            className={`flex-1 min-w-0 transition-all duration-300 ${showTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
          >
            <div className="text-sm font-black tracking-tight truncate text-foreground">
              Torre Libertador 8000
            </div>
            <div className="flex gap-1 items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
              <MapPin className="w-3.5 h-3.5 text-primary" />{" "}
              Av. del Libertador 8000,
              Nuñez
            </div>
          </div>

          <button
            className={`p-2 rounded-full border transition-colors group ${isCollapsed ? "bg-muted/20 hover:bg-muted/40 border-border/50 text-foreground" : "text-white bg-background/30 hover:bg-background/50 border-white/10"}`}
          >
            <Heart className="w-5 h-5 transition-all group-active:fill-red-500 group-active:text-red-500" />
          </button>
        </div>
      </div>

      <div className="h-[420px] relative w-full overflow-hidden">
        <Image
          src="/projects/header-tower.png"
          alt="Torre Libertador"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 to-transparent bg-linear-to-t from-background via-background/80" />
        <div className="absolute right-4 left-4 bottom-16 z-10">
          <div className="space-y-1">
            <Badge className="bg-brand-pink text-white shadow-lg border-0 text-[10px] font-black tracking-widest uppercase hover:bg-brand-pink/90">
              En Construcción
            </Badge>
            <h1 className="text-3xl font-black tracking-tighter uppercase drop-shadow-sm text-foreground">
              Torre Libertador 8000
            </h1>
            <div className="flex items-center text-xs font-bold tracking-wider uppercase text-foreground/80">
              <MapPin className="mr-1 w-4 h-4 text-primary" />{" "}
              Av. del Libertador 8000,
              Nuñez
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 px-4 -mt-12 space-y-6">
        {/* Gallery Stories & Action */}
        <div
          className={`sticky top-[62px] transition-all duration-300 -mx-4 px-4 pt-5 pb-3 ${
            isStoryActive
              ? "z-[10000]"
              : "z-40"
          } ${
            isCollapsed
              ? "border-b backdrop-blur-md bg-background/80 border-border/40"
              : "bg-transparent"
          }`}
        >
          <div className="overflow-x-auto flex-1 py-2 scrollbar-hide">
            <ProjectStories
              stories={STORIES}
            />
          </div>
        </div>

        {/* Purchase Options Carousel */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            activeTab === "financials"
              ? "max-h-0 opacity-0 pointer-events-none mb-0"
              : "max-h-[500px] opacity-100 mb-4"
          }`}
        >
          <Carousel
            className="w-full"
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
          >
            <CarouselContent>
              {PURCHASE_OPTIONS.map(
                (option) => (
                  <CarouselItem
                    key={option.key}
                    className="basis-[88%]"
                  >
                    <Card
                      className={`${option.cardClassName} shadow-sm rounded-[24px] overflow-hidden relative cursor-pointer group active:scale-[0.98] transition-all h-full`}
                    >
                      <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <option.watermarkIcon className="w-48 h-48 -rotate-12" />
                      </div>
                      <CardContent className="flex relative z-10 flex-col justify-between p-5 h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h3 className="flex gap-2 items-center text-lg font-black text-foreground">
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full border backdrop-blur-md shadow-sm ${option.iconContainerClassName}`}
                              >
                                <option.headerIcon className="w-4 h-4" />
                              </div>
                              {
                                option.title
                              }
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                              {
                                option.subtitle
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                              {
                                option.valueLabel
                              }
                            </span>
                            <div className="text-2xl font-black text-foreground">
                              {
                                option.value
                              }
                            </div>
                          </div>
                          <Button
                            size="default"
                            variant="ghost"
                            className={`h-12 text-xs font-black uppercase tracking-widest shadow-none ${option.actionClassName}`}
                            asChild
                          >
                            <Link
                              href={option.getHref(
                                id
                              )}
                            >
                              {
                                option.actionText
                              }
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
          </Carousel>
        </div>

        {/* MAIN CONTENT TABS */}
        <Tabs
          defaultValue="stages"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 p-1 w-full h-14 rounded-2xl border-none bg-muted/50">
            <TabsTrigger
              value="stages"
              className="rounded-xl text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-black uppercase tracking-wider"
            >
              Etapas
            </TabsTrigger>
            <TabsTrigger
              value="financials"
              className="rounded-xl text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-black uppercase tracking-wider"
            >
              Invertir
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="rounded-xl text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-black uppercase tracking-wider"
            >
              Proyecto
            </TabsTrigger>
          </TabsList>

          {/* STAGES TAB */}
          <TabsContent
            value="stages"
            className="mt-6 space-y-4 animate-in fade-in-50 slide-in-from-bottom-4"
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
                      <div className="flex flex-col items-center p-2 text-center rounded-xl border bg-secondary/40 border-border/50">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">
                          Total Uni.
                        </span>
                        <span className="flex gap-1 items-center text-sm font-black">
                          <Home className="w-3 h-3 text-primary" />{" "}
                          {stage.units}
                        </span>
                      </div>
                      <div
                        className={`flex flex-col items-center p-2 text-center rounded-xl border ${stage.status === "active" ? "bg-primary/5 border-primary/20" : "bg-secondary/40 border-border/50"}`}
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
                      <div className="flex flex-col items-center p-2 text-center rounded-xl border bg-secondary/40 border-border/50">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">
                          Mín. Inversión
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
            <div className="space-y-3">
              {PURCHASE_OPTIONS.map(
                (option) => (
                  <Card
                    key={option.key}
                    className={`${option.cardClassName} shadow-sm overflow-hidden`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4 justify-between items-center">
                        <div className="space-y-1 min-w-0">
                          <div className="flex gap-2 items-center">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full border backdrop-blur-md shadow-sm ${option.iconContainerClassName}`}
                            >
                              <option.headerIcon className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-black tracking-tight text-foreground">
                              {
                                option.title
                              }
                            </div>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground line-clamp-1">
                            {option.subtitle.replace(
                              /Comprar\s+/i,
                              ""
                            )}
                          </div>
                          <div className="flex gap-2 items-baseline">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                              {
                                option.valueLabel
                              }
                            </span>
                            <span className="text-lg font-black text-foreground">
                              {
                                option.value
                              }
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-9 text-[10px] font-black uppercase tracking-widest shadow-none ${option.actionClassName}`}
                          asChild
                        >
                          <Link
                            href={option.getHref(
                              id
                            )}
                          >
                            {
                              option.actionText
                            }
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </TabsContent>

          {/* PROJECT OVERVIEW TAB */}
          <TabsContent
            value="overview"
            className="mt-6 space-y-6 animate-in fade-in-50 slide-in-from-bottom-4"
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
