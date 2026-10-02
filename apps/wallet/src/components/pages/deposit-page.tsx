"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { ArrowLeft, Check, Copy, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDepositAddress, useSimulateDeposit } from "@/hooks/use-queries";
import { KycBlockedDialog } from "@/components/kyc/kyc-blocked-dialog";

export default function DepositPage() {
  const router = useRouter();
  const { data, error, isLoading } = useDepositAddress();
  const simulation = useSimulateDeposit();
  const [copied, setCopied] = useState(false);
  const kycError = error as (Error & { status?: "none" | "pending" | "rejected"; rejectionReason?: string | null }) | null;
  if (kycError?.message === "kyc_required" && kycError.status) return <KycBlockedDialog open onOpenChange={(open) => { if (!open) router.back(); }} status={kycError.status} rejectionReason={kycError.rejectionReason} />;
  const address = data?.address ?? "";
  const qrUrl = data?.qrValue ? `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(data.qrValue)}` : "";
  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return <div className="p-4 space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
    <div className="flex gap-2 items-center"><Button variant="ghost" size="icon" asChild><Link href="/"><ArrowLeft className="w-5 h-5" /></Link></Button><h1 className="text-xl font-bold tracking-tight">Ingresar Dinero</h1></div>
    <Card><CardContent className="p-6 space-y-6">
      <div className="space-y-2 text-center"><div className="flex justify-center items-center p-2 mx-auto w-48 h-48 bg-white rounded-xl shadow-inner">{qrUrl ? <img src={qrUrl} width={192} height={192} alt="Código QR para depositar USDT" /> : <QrCode className="w-32 h-32 text-black" />}</div><p className="text-xs text-muted-foreground">Escanea este código QR para depositar USDT</p></div>
      <div className="space-y-2"><Label htmlFor="address">Tu dirección {data?.assetId ?? "USDT"} ({data?.network ?? "TRC20"})</Label><div className="flex gap-2"><Input id="address" value={isLoading ? "Cargando dirección..." : address} readOnly className="font-mono text-xs" /><Button variant="outline" size="icon" disabled={!address} onClick={() => void copyAddress()} aria-label="Copiar dirección">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div></div>
      <div className="space-y-2"><Button className="w-full" disabled={!address || simulation.isPending} onClick={() => simulation.mutate()}>{simulation.isPending ? "Simulando depósito..." : "Simular depósito de 100 USDT"}</Button>{simulation.isSuccess && <p className="text-xs text-green-600">Depósito enviado. Se acreditará automáticamente en unos segundos.</p>}{simulation.error && <p className="text-xs text-destructive">{simulation.error.message}</p>}</div>
      <div className="p-3 text-xs text-blue-600 rounded-lg bg-blue-500/10 dark:text-blue-400">⚠️ Solo envía USDT a través de la red {data?.network ?? "TRC20"}. Enviar cualquier otra moneda resultará en la pérdida permanente de fondos.</div>
    </CardContent></Card>
  </div>;
}
