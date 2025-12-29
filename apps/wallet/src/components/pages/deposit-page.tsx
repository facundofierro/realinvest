import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  ArrowLeft,
  Copy,
  QrCode,
} from "lucide-react";
import Link from "next/link";

export default function DepositPage() {
  return (
    <div className="p-4 space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">
          Ingresar Dinero
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center items-center p-2 mx-auto w-48 h-48 bg-white rounded-xl shadow-inner">
              <QrCode className="w-32 h-32 text-black" />
            </div>
            <p className="text-xs text-muted-foreground">
              Escanea este código QR
              para depositar USDT
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Tu dirección USDT (TRC20)
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value="T9yD14Nj9...j129jd"
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 text-xs text-blue-600 rounded-lg bg-blue-500/10 dark:text-blue-400">
            ⚠️ Solo envía USDT a través
            de la red TRC20. Enviar
            cualquier otra moneda
            resultará en la pérdida
            permanente de fondos.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
