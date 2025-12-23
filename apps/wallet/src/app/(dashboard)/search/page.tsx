import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";

export default function SearchPage() {
  return (
    <div className="p-4 space-y-6 min-h-screen">
        <h1 className="text-2xl font-bold tracking-tight">Explorar Proyectos</h1>
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar por nombre, ubicación..." className="pl-9 h-10" />
            </div>
        </div>
        
        <div className="space-y-4">
             <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Próximos Lanzamientos</h2>
             <div className="grid gap-4">
                 <Card className="bg-muted/30 border-dashed">
                     <CardContent className="p-4 flex items-center justify-between">
                         <div>
                            <div className="font-semibold">Complejo "Los Álamos"</div>
                            <div className="text-sm text-muted-foreground">Mendoza, Argentina</div>
                         </div>
                         <Badge variant="secondary">Marzo 2026</Badge>
                     </CardContent>
                 </Card>
                 <Card className="bg-muted/30 border-dashed">
                     <CardContent className="p-4 flex items-center justify-between">
                         <div>
                            <div className="font-semibold">Edificio "Horizonte"</div>
                            <div className="text-sm text-muted-foreground">Rosario, Santa Fe</div>
                         </div>
                         <Badge variant="secondary">Junio 2026</Badge>
                     </CardContent>
                 </Card>
             </div>
        </div>

        <div className="space-y-4">
             <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Categorías Populares</h2>
             <div className="flex flex-wrap gap-2">
                 <Badge variant="outline" className="px-3 py-1 text-sm">Residencial</Badge>
                 <Badge variant="outline" className="px-3 py-1 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Oficinas</Badge>
                 <Badge variant="outline" className="px-3 py-1 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Comercial</Badge>
                 <Badge variant="outline" className="px-3 py-1 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Industrial</Badge>
             </div>
        </div>
    </div>
  )
}
