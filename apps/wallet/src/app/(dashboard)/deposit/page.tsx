import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { ArrowLeft, Copy, QrCode } from "lucide-react";
import Link from "next/link";

export default function DepositPage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/">
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Ingresar Dinero</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-48 h-48 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-black" />
                </div>
                <p className="text-xs text-muted-foreground">Escanea este código QR para depositar USDT</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Tu dirección USDT (TRC20)</Label>
                <div className="flex gap-2">
                    <Input id="address" value="T9yD14Nj9...j129jd" readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-blue-600 dark:text-blue-400">
                ⚠️ Solo envía USDT a través de la red TRC20. Enviar cualquier otra moneda resultará en la pérdida permanente de fondos.
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
