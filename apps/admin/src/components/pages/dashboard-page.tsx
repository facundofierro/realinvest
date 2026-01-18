"use client";

import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  DollarSign,
  Coins,
  Building2,
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useAdminDashboardStats, usePropertyStatistics } from "@/hooks/use-admin-queries";

export function DashboardPage() {
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboardStats();
  const { data: propertyStats = [], isLoading: isPropertyStatsLoading } = usePropertyStatistics();

  if (isStatsLoading) {
    return <DashboardSkeleton />;
  }

  const topProperties = propertyStats.slice(0, 5);

  return (
    <div className="container py-6 mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Panel de control administrativo
          </p>
        </div>
        <Button asChild>
          <Link href="/properties">
            <Plus className="mr-2 w-4 h-4" />
            Nueva Propiedad
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Liquidez Total
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalLiquidity || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              USDT disponible en plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Valor en Tokens
            </CardTitle>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalTokenMarketCap || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Market cap total de tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Propiedades
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProperties || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Proyectos en plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Transacciones
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de operaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Properties */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Valuable Property */}
        {stats?.mostValuableProperty && (
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center text-base">
                <TrendingUp className="w-4 h-4" />
                Propiedad Más Valiosa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {stats.mostValuableProperty.title}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.mostValuableProperty.value)}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/properties?id=${stats.mostValuableProperty.id}`}>
                    Ver Detalles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highest ROI Property */}
        {stats?.highestRoiProperty && (
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center text-base">
                <TrendingUp className="w-4 h-4" />
                Mayor ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {stats.highestRoiProperty.title}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats.highestRoiProperty.roi}%
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/properties?id=${stats.highestRoiProperty.id}`}>
                    Ver Detalles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Propiedades por Valor</CardTitle>
        </CardHeader>
        <CardContent>
          {isPropertyStatsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))}
            </div>
          ) : topProperties.length > 0 ? (
            <div className="space-y-2">
              {topProperties.map((prop) => (
                <div
                  key={prop.projectId}
                  className="flex justify-between items-center p-3 rounded-lg border transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{prop.projectTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {prop.tokenCount} token(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatCurrency(prop.totalValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No hay propiedades disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/properties">
              <Building2 className="mr-2 w-4 h-4" />
              Gestionar Propiedades
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/activity">
              <Activity className="mr-2 w-4 h-4" />
              Ver Actividad
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/chat">
              Ver Conversaciones
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container py-6 mx-auto space-y-6 max-w-7xl">
      <div className="space-y-2">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-64 h-4" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="w-24 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-32 h-8" />
              <Skeleton className="mt-2 w-40 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="w-40 h-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="w-48 h-5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
