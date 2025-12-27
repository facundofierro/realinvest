import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  TrendingUp,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { SimilarProjectsCarousel } from "@/components/project/stories-section";

const SIMILAR_PROJECTS = [
  {
    id: "barrio-el-ceibo",
    title: 'Barrio Privado "El Ceibo"',
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

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hola, Facundo
          </h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido de nuevo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              CN
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Balance Card */}
      <Card className="bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <CardContent className="p-6 space-y-4 relative z-10">
          <div className="space-y-1">
            <span className="text-primary-foreground/80 text-sm font-medium">
              Balance Total
            </span>
            <div className="text-4xl font-bold tracking-tighter">
              $ 124,500.00
            </div>
            <div className="flex items-center text-brand-green text-sm font-medium">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.5% este mes
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              className="w-full bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 border-0 backdrop-blur-sm h-12"
              asChild
            >
              <Link href="/deposit">
                <ArrowDownLeft className="mr-2 h-4 w-4" />{" "}
                Ingresar
              </Link>
            </Button>
            <Button
              className="w-full bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 border-0 backdrop-blur-sm h-12"
              asChild
            >
              <Link href="/withdraw">
                <ArrowUpRight className="mr-2 h-4 w-4" />{" "}
                Retirar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hot Projects */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Oportunidades Destacadas
          </h2>
          <Link
            href="/invest"
            className="text-sm text-primary font-medium hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <SimilarProjectsCarousel
          projects={SIMILAR_PROJECTS}
          delay={4000}
        />
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                  {i === 1 ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {i === 1
                      ? "Depósito USD"
                      : "Compra Token Torre L."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hoy, 10:23 AM
                  </p>
                </div>
              </div>
              <div
                className={`font-semibold text-sm ${i === 1 ? "text-primary" : ""}`}
              >
                {i === 1
                  ? "+ $1,000.00"
                  : "- $500.00"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
