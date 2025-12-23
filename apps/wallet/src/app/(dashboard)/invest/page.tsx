import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Search, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function InvestPage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold tracking-tight">Invertir</h1>
      
      <div className="grid gap-4">
        <Link href="/search">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Explorar Proyectos</CardTitle>
              <Search className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Busca oportunidades inmobiliarias activas y comienza a invertir.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <div className="grid grid-cols-2 gap-4">
             <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                    <Building2 className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-sm">Desarrollos</span>
                </CardContent>
             </Card>
             <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                    <span className="font-semibold text-sm">Renta</span>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
