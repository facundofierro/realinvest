"use client";

import { useEffect, useState } from "react";
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
import { getDashboardProjects } from "@/lib/api-client";

interface DashboardProject {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  roi: number;
  progress: number;
  priceRange: string;
  fixedRent: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getDashboardProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load dashboard projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
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
        <div className="flex gap-3 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Bell className="w-5 h-5" />
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
      <Card className="overflow-hidden relative text-white from-gray-900 rounded-3xl border-none shadow-xl bg-linear-to-br via-slate-900 to-violet-950">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/10"></div>

        <CardContent className="relative z-10 p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-sm font-medium text-primary-foreground/80">
              Balance Total
            </span>
            <div className="text-4xl font-bold tracking-tighter">
              $ 124,500.00
            </div>
            <div className="flex items-center text-sm font-medium text-brand-green">
              <TrendingUp className="mr-1 w-4 h-4" />
              +12.5% este mes
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              variant="ghost"
              className="w-full bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 border border-white/10 backdrop-blur-md h-12 rounded-2xl text-white font-bold shadow-none"
              asChild
            >
              <Link href="/deposit">
                <ArrowDownLeft className="mr-2 w-4 h-4" />{" "}
                Ingresar
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 border border-white/10 backdrop-blur-md h-12 rounded-2xl text-white font-bold shadow-none"
              asChild
            >
              <Link href="/withdraw">
                <ArrowUpRight className="mr-2 w-4 h-4" />{" "}
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
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <SimilarProjectsCarousel
          projects={projects}
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
              className="flex justify-between items-center p-3 rounded-2xl border shadow-sm transition-colors bg-card hover:bg-muted/50"
            >
              <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-10 h-10 rounded-2xl border bg-primary/10 text-primary border-primary/10">
                  {i === 1 ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
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