import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WithdrawPage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" asChild>
            <Link href="/">
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Retirar Fondos</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
                <Label>Monto a retirar</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input type="number" placeholder="0.00" className="pl-6" />
                </div>
                <p className="text-xs text-muted-foreground text-right">Disponible: $124,500.00</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección de destino (TRC20)</Label>
                <Input id="address" placeholder="Ingrese su dirección de billetera" className="font-mono text-xs" />
            </div>

            <Button className="w-full" size="lg">Solicitar Retiro</Button>
        </CardContent>
      </Card>
      
       <div className="rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">
           ⚠️ Los retiros pueden tardar hasta 24 horas en procesarse por seguridad.
       </div>
    </div>
  );
}
