import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ArrowLeft, MapPin, Calendar, FileText, Info } from "lucide-react";
import Link from "next/link";

export default function ProjectPage() {
  return (
    <div className="bg-background min-h-screen pb-24 relative">
        {/* Header Image */}
        <div className="h-64 bg-slate-200 relative">
             <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
             <Link href="/dashboard" className="absolute top-4 left-4 bg-background/50 backdrop-blur-md p-2 rounded-full hover:bg-background/80 transition-colors">
                <ArrowLeft className="h-6 w-6" />
             </Link>
             <div className="absolute bottom-4 left-4 right-4">
                <Badge className="mb-2 bg-primary/90 hover:bg-primary">En Construcción</Badge>
                <h1 className="text-2xl font-bold text-foreground">Torre Libertador 8000</h1>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" /> Av. del Libertador 8000, Nuñez
                </div>
             </div>
        </div>

        <div className="p-4 space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-2">
                <Card className="border shadow-sm">
                    <CardContent className="p-3 text-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold">TIR Est.</div>
                        <div className="text-lg font-bold text-primary">12%</div>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardContent className="p-3 text-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold">Plazo</div>
                        <div className="text-lg font-bold">24 m</div>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardContent className="p-3 text-center">
                        <div className="text-xs text-muted-foreground uppercase font-bold">Min.</div>
                        <div className="text-lg font-bold">$100</div>
                    </CardContent>
                </Card>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="font-medium">$1,300,000 recaudados</span>
                    <span className="text-muted-foreground">de $2,000,000</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                     <div className="bg-primary h-full w-[65%]" />
                </div>
                <div className="text-xs text-muted-foreground text-right">65% financiado</div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="overview">Detalles</TabsTrigger>
                    <TabsTrigger value="financials">Finanzas</TabsTrigger>
                    <TabsTrigger value="docs">Docs</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Sobre el proyecto</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Torre Libertador 8000 es un desarrollo premium en una de las zonas más exclusivas de Buenos Aires. 
                            Contará con 20 pisos de unidades residenciales de lujo, amenities de primer nivel y vistas panorámicas al río.
                        </p>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Amenities</h3>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" /> Piscina Infinity</li>
                            <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" /> Gym & Spa</li>
                            <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" /> Coworking</li>
                            <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" /> Seguridad 24hs</li>
                        </ul>
                    </div>
                </TabsContent>
                <TabsContent value="financials" className="mt-4">
                     <div className="p-4 bg-muted/20 rounded-lg text-center text-muted-foreground">
                         <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                         Información financiera detallada disponible para usuarios registrados verificado.
                     </div>
                </TabsContent>
                 <TabsContent value="docs" className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start h-12">
                        <FileText className="mr-2 h-4 w-4" /> Whitepaper.pdf
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12">
                        <FileText className="mr-2 h-4 w-4" /> Brochure Comercial.pdf
                    </Button>
                </TabsContent>
            </Tabs>
        </div>

        {/* Fixed Action Button */}
        <div className="fixed bottom-20 left-4 right-4 z-40">
            <Button className="w-full h-14 text-lg shadow-2xl shadow-primary/40 animate-in slide-in-from-bottom-10 delay-300">
                Invertir Ahora
            </Button>
        </div>
    </div>
  )
}
