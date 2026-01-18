"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity as ActivityIcon,
  Filter,
} from "lucide-react";
import { useAllTransactions } from "@/hooks/use-admin-queries";

export function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: transactions = [], isLoading } = useAllTransactions({
    type: typeFilter as any,
    status: statusFilter as any,
  });

  // Calculate stats
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.status === "COMPLETED"
  ).length;
  const pendingTransactions = transactions.filter((t) => t.status === "PENDING")
    .length;
  const totalVolume = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "WITHDRAWAL":
        return <ArrowUpRight className="w-4 h-4" />;
      case "BUY":
      case "SELL":
        return <ShoppingCart className="w-4 h-4" />;
      case "DIVIDEND":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <ActivityIcon className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "Depósito";
      case "WITHDRAWAL":
        return "Retiro";
      case "BUY":
        return "Compra";
      case "SELL":
        return "Venta";
      case "DIVIDEND":
        return "Dividendo";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  return (
    <div className="container py-6 mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Actividad</h1>
        <p className="text-muted-foreground">
          Monitorea todas las transacciones de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Transacciones
            </CardTitle>
            <ActivityIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Todas las operaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {completedTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTransactions > 0
                ? Math.round((completedTransactions / totalTransactions) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <ActivityIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingTransactions}
            </div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground">Transaccionado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filtros</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTypeFilter(undefined);
                setStatusFilter(undefined);
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <Select
                value={typeFilter || "all"}
                onValueChange={(value) =>
                  setTypeFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="DEPOSIT">Depósito</SelectItem>
                  <SelectItem value="WITHDRAWAL">Retiro</SelectItem>
                  <SelectItem value="BUY">Compra</SelectItem>
                  <SelectItem value="SELL">Venta</SelectItem>
                  <SelectItem value="DIVIDEND">Dividendo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[200px]">
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="FAILED">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        {getTransactionIcon(transaction.type)}
                        <span className="font-medium">
                          {getTransactionLabel(transaction.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground">
                        {transaction.userId.substring(0, 12)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {transaction.currencyCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status) as any}>
                        {transaction.status === "COMPLETED"
                          ? "Completado"
                          : transaction.status === "PENDING"
                          ? "Pendiente"
                          : "Fallido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {transaction.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <ActivityIcon className="mb-4 w-12 h-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                No hay transacciones
              </h3>
              <p className="text-sm text-muted-foreground">
                Las transacciones aparecerán aquí cuando se realicen
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="container py-6 mx-auto space-y-6 max-w-7xl">
      <div className="space-y-2">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-64 h-4" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="w-32 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-16 h-8" />
              <Skeleton className="mt-2 w-24 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="w-24 h-5" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="w-[200px] h-10" />
            <Skeleton className="w-[200px] h-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="w-48 h-5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
