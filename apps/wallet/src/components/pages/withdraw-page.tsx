"use client";

import { useCreateWithdrawal, useTransactions, useWalletBalances } from "@/hooks/use-queries";
import { useKycGate } from "@/hooks/use-kyc-gate";
import { useMemo, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ResponsiveOverlay, ResponsiveOverlayDescription, ResponsiveOverlayFooter, ResponsiveOverlayHeader, ResponsiveOverlayTitle } from "@/components/responsive-overlay";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { KycBlockedDialog } from "@/components/kyc/kyc-blocked-dialog";

const FEE = 1;

export default function WithdrawPage() {
  const { data: balances = [], isLoading: isBalancesLoading } = useWalletBalances();
  const withdrawal = useCreateWithdrawal();
  const withdrawalId = withdrawal.data?.id;
  // Custody settles server-side within seconds; poll until this withdrawal reaches a final state.
  const { data: transactionHistory = [] } = useTransactions({
    refetchInterval: (items) => {
      const current = withdrawalId ? items?.find((item) => item.id === withdrawalId) : undefined;
      return withdrawalId && current?.status !== "COMPLETED" && current?.status !== "FAILED" ? 1000 : false;
    },
  });
  const gate = useKycGate();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const availableUsdt = useMemo(() => balances.find((balance) => balance.currencyCode === "USDT")?.available ?? 0, [balances]);
  const parsedAmount = Number(amount);
  const totalDebit = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount + FEE : 0;
  const validAddress = /^[A-Za-z0-9]{12,256}$/.test(address.trim());
  const canSubmit = totalDebit > FEE && totalDebit <= availableUsdt && validAddress && !withdrawal.isPending;
  const latestWithdrawal = withdrawalId ? transactionHistory.find((item) => item.id === withdrawalId) ?? withdrawal.data : undefined;
  const status = latestWithdrawal?.metadata?.custodyStatus as string | undefined;
  async function submit() { try { await withdrawal.mutateAsync({ amount: parsedAmount, address: address.trim() }); setConfirmOpen(false); } catch { /* displayed below */ } }

  return <div className="p-4 mx-auto w-full max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-2"><Button variant="ghost" size="icon" asChild><Link href="/"><ArrowLeft className="h-5 w-5" /></Link></Button><h1 className="text-xl font-bold tracking-tight">Retirar Fondos</h1></div>
    <Card><CardContent className="p-6 space-y-4">
      <div className="space-y-2"><Label htmlFor="amount">Monto a retirar</Label><div className="relative"><span className="absolute left-3 top-2.5 text-muted-foreground">$</span><Input id="amount" type="number" min="0" step="any" placeholder="0.00" className="pl-6" value={amount} onChange={(event) => setAmount(event.target.value)} /></div><div className="flex justify-end items-center gap-1 text-xs text-muted-foreground">Disponible: {isBalancesLoading ? <Skeleton className="h-3 w-16" /> : `$${availableUsdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div></div>
      <div className="space-y-2"><Label htmlFor="address">Dirección de destino (TRC20)</Label><Input id="address" placeholder="Ingrese su dirección de billetera" className="font-mono text-xs" value={address} onChange={(event) => setAddress(event.target.value)} />{address && !validAddress && <p className="text-xs text-destructive">Ingresa una dirección TRC20 válida.</p>}</div>
      <div className="rounded-lg bg-muted p-3 space-y-1 text-sm"><div className="flex justify-between"><span>Comisión de red</span><span>1.00 USDT</span></div><div className="flex justify-between font-medium"><span>Débito total</span><span>{totalDebit.toFixed(2)} USDT</span></div></div>
      {totalDebit > availableUsdt && totalDebit > 0 && <p className="text-xs text-destructive">Saldo insuficiente para cubrir el monto y la comisión.</p>}
      <Button className="w-full" size="lg" disabled={!canSubmit} onClick={() => gate.guard(() => setConfirmOpen(true))}>Solicitar Retiro</Button>
      {withdrawal.error && <p className="text-xs text-destructive">{withdrawal.error.message}</p>}
      {latestWithdrawal && <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">Retiro enviado: {latestWithdrawal.status === "COMPLETED" ? "completado" : latestWithdrawal.status === "FAILED" ? "fallido" : status === "CONFIRMING" ? "confirmando" : "pendiente"}. La actividad se actualizará automáticamente.</div>}
    </CardContent></Card>
    <div className="rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">⚠️ Los retiros simulados progresan automáticamente por seguridad.</div>
    <ResponsiveOverlay open={confirmOpen} onOpenChange={setConfirmOpen}><ResponsiveOverlayHeader><ResponsiveOverlayTitle>Confirmar retiro</ResponsiveOverlayTitle><ResponsiveOverlayDescription>Enviar {parsedAmount.toFixed(2)} USDT a {address.trim()}. Se reservarán {totalDebit.toFixed(2)} USDT, incluida la comisión de 1 USDT.</ResponsiveOverlayDescription></ResponsiveOverlayHeader><ResponsiveOverlayFooter sticky><Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button><Button disabled={withdrawal.isPending} onClick={() => void submit()}>Confirmar retiro</Button></ResponsiveOverlayFooter></ResponsiveOverlay>
    <KycBlockedDialog open={gate.blockedDialogOpen} onOpenChange={gate.setBlockedDialogOpen} status={gate.status} rejectionReason={gate.rejectionReason} />
  </div>;
}
