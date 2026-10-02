"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { formatPrice, parseUsdString } from "@/lib/format";
import { useInvestPurchase, useTransactions } from "@/hooks/use-queries";
import type { ProjectUnit } from "@/types/wallet";

interface InvestConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unit: ProjectUnit | null;
  projectId: string;
  availableBalance: number;
}

type Step = "amount" | "review" | "processing" | "success" | "failed";

const errorCopy: Record<string, string> = {
  INSUFFICIENT_BALANCE: "No tenés saldo USDT suficiente para esta compra.",
  SOLD_OUT: "Los tokens seleccionados ya no están disponibles.",
  NOT_AVAILABLE: "Esta unidad no está disponible para invertir.",
  NOT_TOKENIZED: "Esta unidad no está tokenizada.",
  UNIT_NOT_FOUND: "No encontramos esta unidad. Actualizá la página e intentá de nuevo.",
};

export function InvestConfirmDialog({ isOpen, onClose, unit, projectId, availableBalance }: InvestConfirmDialogProps) {
  const [step, setStep] = useState<Step>("amount");
  const [tokenAmount, setTokenAmount] = useState(1);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const purchase = useInvestPurchase(projectId);
  const { data: transactions = [] } = useTransactions();
  const queryClient = useQueryClient();
  const remaining = Math.max(0, (unit?.totalTokens ?? 0) - (unit?.tokensSold ?? 0));
  const pricePerToken = useMemo(() => unit ? parseUsdString(unit.price) / (unit.totalTokens || 1) : 0, [unit]);
  const totalCost = Math.round(pricePerToken * tokenAmount * 100) / 100;

  useEffect(() => {
    if (isOpen) {
      const reset = window.setTimeout(() => {
        setStep("amount");
        setTokenAmount(1);
        setTransactionId(null);
        setError(null);
      }, 0);
      return () => window.clearTimeout(reset);
    }
  }, [isOpen, unit?.id]);

  useEffect(() => {
    if (step !== "processing" || !transactionId) return;
    const transaction = transactions.find((item) => item.id === transactionId);
    if (!transaction || transaction.status === "PENDING") return;
    const settled = window.setTimeout(() => {
      if (transaction.status === "COMPLETED") {
        queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
        queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
        queryClient.invalidateQueries({ queryKey: ["projects", projectId, "units"] });
        setStep("success");
      } else {
        setError(String(transaction.metadata?.failureReason ?? "No pudimos completar la compra. Tu saldo fue reintegrado."));
        setStep("failed");
      }
    }, 0);
    return () => window.clearTimeout(settled);
  }, [projectId, queryClient, step, transactionId, transactions]);

  if (!unit) return null;
  const canContinue = tokenAmount >= 1 && tokenAmount <= remaining && totalCost <= availableBalance;
  const limitMessage = tokenAmount > remaining
    ? "La cantidad supera los tokens disponibles."
    : totalCost > availableBalance ? "No tenés saldo USDT suficiente." : null;
  const changeAmount = (next: number) => setTokenAmount(Math.max(1, Math.min(remaining || 1, Math.floor(next) || 1)));
  const confirm = async () => {
    setError(null);
    try {
      const transaction = await purchase.mutateAsync({ unitId: unit.id, tokenAmount });
      setTransactionId(transaction.id);
      setStep("processing");
    } catch (cause) {
      const apiError = cause as Error & { code?: string };
      setError(errorCopy[apiError.code ?? ""] ?? apiError.message ?? "No pudimos iniciar la compra.");
      setStep("review");
    }
  };

  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="p-0 w-[calc(100%-2rem)] max-w-[440px] overflow-hidden rounded-[32px]">
      <DialogTitle className="sr-only">Comprar tokens de {unit.unitCode}</DialogTitle>
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex gap-2 items-center"><span className="font-mono text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded">{unit.tokenSymbol}</span><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inversión primaria</span></div>
          <h2 className="mt-2 text-lg font-black uppercase">{unit.title || unit.unitCode}</h2>
        </div>

        {step === "amount" && <div className="space-y-5">
          <div className="space-y-2"><p className="text-xs font-bold text-muted-foreground uppercase">Cantidad de tokens</p>
            <div className="flex items-center gap-3"><Button type="button" variant="outline" size="icon" onClick={() => changeAmount(tokenAmount - 1)} disabled={tokenAmount <= 1}><Minus className="w-4 h-4" /></Button><Input type="number" min={1} max={remaining} value={tokenAmount} onChange={(event) => changeAmount(Number(event.target.value))} className="h-12 text-center font-black" /><Button type="button" variant="outline" size="icon" onClick={() => changeAmount(tokenAmount + 1)} disabled={tokenAmount >= remaining}><Plus className="w-4 h-4" /></Button></div>
            <p className="text-xs text-muted-foreground">{remaining} tokens disponibles · {formatPrice(pricePerToken)} por token</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4 flex justify-between"><span className="font-bold">Total</span><span className="font-black">{formatPrice(totalCost)} USDT</span></div>
          {limitMessage && <p className="text-sm text-destructive">{limitMessage}</p>}
          <Button className="w-full" onClick={() => setStep("review")} disabled={!canContinue}>Continuar</Button>
        </div>}

        {step === "review" && <div className="space-y-4"><div className="rounded-2xl bg-muted/40 p-4 space-y-2 text-sm"><div className="flex justify-between"><span>Tokens</span><b>{tokenAmount}</b></div><div className="flex justify-between"><span>Precio por token</span><b>{formatPrice(pricePerToken)}</b></div><div className="flex justify-between"><span>Total</span><b>{formatPrice(totalCost)} USDT</b></div><div className="flex justify-between text-muted-foreground"><span>Saldo resultante</span><b>{formatPrice(Math.max(0, availableBalance - totalCost))} USDT</b></div></div>{error && <p className="text-sm text-destructive">{error}</p>}<div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={() => setStep("amount")}>Volver</Button><Button className="flex-1" onClick={confirm} disabled={purchase.isPending}>Confirmar compra</Button></div></div>}

        {step === "processing" && <div className="py-6 text-center space-y-3"><Loader2 className="w-9 h-9 mx-auto text-primary animate-spin" /><p className="font-black">Procesando tu compra...</p><p className="text-sm text-muted-foreground">Estamos confirmando la transferencia de USDT.</p><Button variant="outline" onClick={onClose}>Cerrar</Button></div>}
        {step === "success" && <div className="py-6 text-center space-y-3"><CheckCircle2 className="w-10 h-10 mx-auto text-primary" /><p className="font-black">Compra completada</p><p className="text-sm text-muted-foreground">Ya tenés {tokenAmount} tokens de {unit.tokenSymbol}.</p><Button onClick={onClose}>Listo</Button></div>}
        {step === "failed" && <div className="py-6 text-center space-y-3"><p className="font-black">No se completó la compra</p><p className="text-sm text-destructive">{error}</p><Button onClick={onClose}>Cerrar</Button></div>}
      </div>
    </DialogContent>
  </Dialog>;
}
