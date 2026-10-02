"use client";

import { formatCurrency } from "@/lib/format";
import { computeHoldingsTotals } from "@/lib/portfolio";
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
  Bell,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { SimilarProjectsCarousel } from "@/components/project/stories-section";
import {
  useDashboardProjects,
  useWalletBalances,
  useWalletHoldings,
  useTransactions,
} from "@/hooks/use-queries";
import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@repo/ui/lib/utils";

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
  const { user } = useCurrentUser();
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    refetch: refetchProjects,
  } = useDashboardProjects();
  const {
    data: balances = [],
    isLoading: isBalancesLoading,
    isError: isBalancesError,
    refetch: refetchBalances,
  } = useWalletBalances();
  const {
    data: holdings = [],
    isLoading: isHoldingsLoading,
    isError: isHoldingsError,
    refetch: refetchHoldings,
  } = useWalletHoldings();
  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    refetch: refetchTransactions,
  } = useTransactions();

  const portfolioTotals = useMemo(() => computeHoldingsTotals(holdings), [holdings]);
  const totalBalance = useMemo(() => {
    const cash =
      balances.find(
        (b) => b.currencyCode === "USDT"
      )?.available ?? 0;
    return cash + portfolioTotals.totalValue;
  }, [balances, portfolioTotals]);

  const isLoading =
    isProjectsLoading ||
    isBalancesLoading ||
    isHoldingsLoading ||
    isTransactionsLoading;
  const isError = isProjectsError || isBalancesError || isHoldingsError || isTransactionsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="font-black uppercase text-sm mb-2">No pudimos cargar tu inicio</h3>
          <p className="text-sm text-muted-foreground mb-4">Revisá tu conexión e intentá de nuevo.</p>
          <Button onClick={() => { void refetchProjects(); void refetchBalances(); void refetchHoldings(); void refetchTransactions(); }}>
            Reintentar
          </Button>
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
            Hola, {user?.name?.split(" ")[0] || "Inversor"}
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

      {user?.kycStatus !== "approved" && <Card className="border-primary/20 bg-primary/5"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{user?.kycStatus === "pending" ? "Tu verificación está en revisión" : user?.kycStatus === "rejected" ? "Tu verificación necesita una nueva presentación" : "Completá tu verificación de identidad"}</p><p className="text-sm text-muted-foreground">Necesitamos esta información para habilitar todas las funciones.</p></div><Button asChild size="sm"><Link href="/kyc">{user?.kycStatus === "rejected" ? "Reintentar" : user?.kycStatus === "pending" ? "Ver estado" : "Verificarme"}</Link></Button></CardContent></Card>}

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
              {formatCurrency(
                totalBalance
              )}
            </div>
            <div className={cn("flex items-center text-sm font-medium", portfolioTotals.pnlPct >= 0 ? "text-brand-green" : "text-destructive")}>
              {portfolioTotals.pnlPct >= 0 ? "+" : ""}{portfolioTotals.pnlPct.toFixed(1)}% P&amp;L no realizado
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
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3">Todavía no tenés movimientos</p>
          ) : transactions
            .slice(0, 3)
            .map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3 rounded-2xl border shadow-sm transition-colors bg-card hover:bg-muted/50"
              >
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-10 h-10 rounded-2xl border bg-primary/10 text-primary border-primary/10">
                    {tx.type ===
                      "DEPOSIT" ||
                    tx.type ===
                      "DIVIDEND" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        tx.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-semibold text-sm ${tx.type === "DEPOSIT" || tx.type === "DIVIDEND" ? "text-primary" : ""}`}
                >
                  {tx.type ===
                    "DEPOSIT" ||
                  tx.type ===
                    "DIVIDEND" ||
                  tx.type === "SELL"
                    ? "+"
                    : "-"}{" "}
                  {formatCurrency(
                    tx.amount.amount
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
