import { Button } from "@repo/ui/components/ui/button";
import { GradientButton } from "@repo/ui/components/ui/gradient-button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@repo/ui/components/ui/dialog";
import { 
    ArrowLeft, MapPin, Calendar, FileText, Info, ChevronRight, 
    ShoppingBag, Layers, Home, Play, Maximize2, TrendingUp, 
    BarChart3, PieChart, DollarSign, Wallet, Building2, 
    ArrowUpRight, Download, Calculator
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const STORIES = [
  { id: 1, title: "Exterior", image: "/projects/header-tower.png", color: "from-blue-500 to-cyan-400" },
  { id: 2, title: "Cocina", image: "/projects/kitchen.png", color: "from-orange-400 to-red-500" },
  { id: 3, title: "Amenities", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800", color: "from-green-400 to-emerald-600" },
  { id: 4, title: "Vistas", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800", color: "from-purple-400 to-indigo-600" },
];

const STAGES = [
  { 
    id: 1, 
    name: "Etapa 1: Lanzamiento", 
    date: "Marzo 2024", 
    status: "active", 
    units: 20, 
    available: 5,
    minPrice: 100 
  },
  { 
    id: 2, 
    name: "Etapa 2: Pozo", 
    date: "Septiembre 2024", 
    status: "upcoming", 
    units: 35, 
    available: 35,
    minPrice: 110 
  },
];

const UNITS = [
    { id: "101", type: "2 Amb", floor: "1", status: "Disponible", price: "$125,000", tokens: 1250 },
    { id: "402", type: "3 Amb", floor: "4", status: "Vendido", price: "$210,000", tokens: 2100 },
    { id: "805", type: "Studio", floor: "8", status: "Disponible", price: "$95,000", tokens: 950 },
    { id: "1201", type: "Penth.", floor: "12", status: "Reservado", price: "$450,000", tokens: 4500 },
    { id: "302", type: "2 Amb", floor: "3", status: "Disponible", price: "$130,000", tokens: 1300 },
];

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="bg-background min-h-screen pb-32 relative">
        {/* Header Image */}
        <div className="h-[420px] relative w-full overflow-hidden">
             <Image 
                src="/projects/header-tower.png" 
                alt="Torre Libertador" 
                fill 
                className="object-cover"
                priority
             />
             <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
             
             <Link href="/dashboard" className="absolute top-4 left-4 bg-background/30 backdrop-blur-md p-2 rounded-full hover:bg-background/50 transition-colors z-10 border border-white/10 text-white">
                <ArrowLeft className="h-6 w-6" />
             </Link>
             
             <div className="absolute bottom-16 left-4 right-4 z-10">
                <div className="space-y-1">
                    <Badge variant="pink" className="shadow-lg border-0 text-[10px] font-bold tracking-widest uppercase">En Construcción</Badge>
                    <h1 className="text-3xl font-bold text-foreground drop-shadow-sm">Torre Libertador 8000</h1>
                    <div className="flex items-center text-sm text-foreground/80 font-medium">
                        <MapPin className="h-4 w-4 mr-1 text-primary" /> Av. del Libertador 8000, Nuñez
                    </div>
                </div>
             </div>
        </div>

        <div className="px-4 -mt-12 relative z-20 space-y-8">
            {/* Gallery Stories & Action */}
            <div className="flex items-center gap-4">
                <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 min-w-max">
                        {STORIES.map((story) => (
                            <Dialog key={story.id}>
                                <DialogTrigger asChild>
                                    <button className="flex flex-col items-center gap-2 group transition-transform active:scale-95">
                                        <div className="p-[2.5px] rounded-full bg-linear-to-tr from-brand-lime via-brand-green to-brand-teal shadow-sm group-hover:scale-105 transition-all">
                                            <Avatar className="w-16 h-16 border-2 border-background">
                                                <AvatarImage src={story.image} className="object-cover" />
                                                <AvatarFallback>{story.title[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{story.title}</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-full h-[85vh] p-0 overflow-hidden bg-black/95 border-none">
                                    <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/80 to-transparent">
                                        <DialogTitle className="text-white flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-linear-to-tr from-brand-lime via-brand-green to-brand-teal" />
                                            {story.title}
                                        </DialogTitle>
                                        <DialogDescription className="sr-only">Imagen de {story.title}</DialogDescription>
                                    </DialogHeader>
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <Image 
                                            src={story.image} 
                                            alt={story.title} 
                                            fill 
                                            className="object-contain"
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </div>
                <GradientButton size="lg" className="rounded-2xl px-8 shadow-xl h-14 min-w-[120px]">
                    Invertir
                </GradientButton>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden group hover:border-primary/50 transition-colors">
                    <CardContent className="p-3 text-center">
                        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">ROI Est.</div>
                        <div className="text-xl font-black text-brand-green flex items-center justify-center gap-1">
                            12.4% <ArrowUpRight className="w-3 h-3" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden group hover:border-primary/50 transition-colors">
                    <CardContent className="p-3 text-center">
                        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Plazo</div>
                        <div className="text-xl font-black text-foreground">24 m</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden group hover:border-primary/50 transition-colors">
                    <CardContent className="p-3 text-center">
                        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Liquidez</div>
                        <div className="text-xl font-black text-brand-green flex items-center justify-center gap-1">
                            High
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* EXCHANGE GATEWAY */}
             <Card className="bg-linear-to-br from-primary/10 via-background to-secondary/5 border-primary/20 shadow-xl overflow-hidden relative cursor-pointer group active:scale-[0.98] transition-all">
                <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <ShoppingBag className="w-48 h-48 -rotate-12" />
                </div>
                <CardContent className="p-5 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h3 className="font-black text-xl text-foreground flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" /> Mercado Secundario
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Comprá o vendé tokens de este proyecto ahora</p>
                        </div>
                        <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 animate-pulse">Live</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Precio de Mercado</span>
                             <div className="text-2xl font-black text-foreground">$114.20</div>
                             <div className="text-[10px] text-brand-green font-bold">+2.4% vs Lanzamiento</div>
                        </div>
                        <div className="space-y-1 text-right">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Tokens en Venta</span>
                             <div className="text-2xl font-black text-foreground">1,420</div>
                             <div className="text-[10px] text-muted-foreground font-bold italic underline">Ver todas las órdenes</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* MAIN CONTENT TABS */}
            <Tabs defaultValue="stages" className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-muted/30 p-1 h-14 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <TabsTrigger value="stages" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs font-bold uppercase tracking-wider">Roadmap</TabsTrigger>
                    <TabsTrigger value="financials" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs font-bold uppercase tracking-wider">Finanzas</TabsTrigger>
                    <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-xs font-bold uppercase tracking-wider">Proyecto</TabsTrigger>
                </TabsList>

                {/* STAGES TAB */}
                <TabsContent value="stages" className="space-y-6 mt-8 animate-in fade-in-50 slide-in-from-bottom-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary" /> Fases de Construcción
                            </h3>
                        </div>

                        {STAGES.map((stage) => (
                            <Card key={stage.id} className={`overflow-hidden border-l-4 transition-all hover:shadow-lg ${stage.status === 'active' ? 'border-l-primary shadow-md ring-1 ring-primary/10' : 'border-l-muted-foreground/20 opacity-70 bg-muted/10'}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-base text-foreground uppercase tracking-tight">{stage.name}</h4>
                                            <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                <Calendar className="h-3 w-3 mr-1 text-primary" /> Estimado: {stage.date}
                                            </div>
                                        </div>
                                        {stage.status === 'active' ? (
                                            <Badge className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">VENTA ABIERTA</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground font-bold">PRÓXIMAMENTE</Badge>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="bg-secondary/40 p-2 rounded-xl border border-border/50">
                                            <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">Total Uni.</span>
                                            <span className="font-black text-sm flex items-center gap-1">
                                                <Home className="h-3 w-3 text-primary" /> {stage.units}
                                            </span>
                                        </div>
                                        <div className={`p-2 rounded-xl border ${stage.status === 'active' ? 'bg-primary/5 border-primary/20' : 'bg-secondary/40 border-border/50'}`}>
                                            <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">Disponibles</span>
                                            <span className="font-black text-sm text-primary">{stage.available}</span>
                                        </div>
                                        <div className="bg-secondary/40 p-2 rounded-xl border border-border/50">
                                            <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1">Min. Entry</span>
                                            <span className="font-black text-sm text-foreground">${stage.minPrice}</span>
                                        </div>
                                    </div>

                                    {stage.status === 'active' && (
                                        <Link href={`/project/${id}/units`} className="block w-full">
                                            <Button className="w-full font-bold uppercase tracking-widest text-xs h-10 group" variant="secondary">
                                                Explorar Unidades <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* PROJECT MAP OVERVIEW */}
                        <div className="space-y-4 pt-4">
                             <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Mapa General del Proyecto</h4>
                             <Card className="overflow-hidden border-border/50 bg-secondary/20 relative group">
                                <Image 
                                    src="/projects/site-plan.png" 
                                    alt="Site Plan" 
                                    width={400} 
                                    height={300} 
                                    className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                    <Button size="sm" variant="secondary" className="font-bold shadow-xl">
                                        <Maximize2 className="w-4 h-4 mr-2" /> Ampliar Mapa
                                    </Button>
                                </div>
                             </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* FINANCIALS TAB */}
                <TabsContent value="financials" className="space-y-6 mt-8 animate-in fade-in-50 slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-4">
                         <Card className="bg-primary/5 border-primary/20 shadow-sm">
                            <CardContent className="p-4 space-y-1">
                                <TrendingUp className="w-5 h-5 text-primary mb-2" />
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">TIR Proyectada</span>
                                <div className="text-2xl font-black text-brand-green">12.4%</div>
                            </CardContent>
                         </Card>
                         <Card className="bg-secondary/20 border-border/50 shadow-sm">
                            <CardContent className="p-4 space-y-1">
                                <DollarSign className="w-5 h-5 text-brand-green mb-2" />
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">VAN (NPV)</span>
                                <div className="text-2xl font-black text-foreground">$2.8M</div>
                            </CardContent>
                         </Card>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-black text-lg flex items-center gap-2">
                             <BarChart3 className="w-5 h-5 text-primary" /> Flujo de Fondos Proyectado
                        </h4>
                        <Card className="p-4 bg-muted/10 border-dashed border-2 border-border/50">
                             <div className="space-y-6">
                                 {[
                                     { label: 'Construcción', progress: 100, val: '$1.4M', color: 'bg-primary' },
                                     { label: 'Marketing/Ventas', progress: 45, val: '$0.6M', color: 'bg-orange-500' },
                                     { label: 'Reservas/Legal', progress: 80, val: '$0.2M', color: 'bg-brand-green' },
                                 ].map((item, i) => (
                                     <div key={i} className="space-y-2">
                                         <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                                             <span>{item.label}</span>
                                             <span className="text-muted-foreground">{item.val}</span>
                                         </div>
                                         <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                             <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${item.progress}%` }} />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </Card>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="font-black text-lg flex items-center gap-2">
                             <PieChart className="w-5 h-5 text-primary" /> Programa de Dividendos
                        </h4>
                        <div className="space-y-3">
                            {[
                                { date: 'Dic 2024', event: 'Inicio de Rentas', type: 'Distribución' },
                                { date: 'Jun 2025', event: 'Finalización Obra', type: 'Appreciation' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-background border border-border/50 text-primary">
                                            <Calculator className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-black text-sm">{item.event}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.date}</div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-black uppercase">{item.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* PROJECT OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8 mt-8 animate-in fade-in-50 slide-in-from-bottom-4">
                     <div className="space-y-4">
                        <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
                            <Building2 className="w-5 h-5 text-primary" /> Desarrollado por RealInvest
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            Torre Libertador 8000 redefine el skyline de Nuñez. Un desarrollo premium de 20 pisos que combina arquitectura vanguardista con sustentabilidad. Unidades de 2, 3 y 4 ambientes con terminaciones de categoría AAA.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Arquitecto</span>
                             <div className="font-black text-sm uppercase">Pelli Clarke Pelli</div>
                        </div>
                        <div className="space-y-1">
                             <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Entrega</span>
                             <div className="font-black text-sm uppercase">Dic 2025</div>
                        </div>
                    </div>

                     <div className="space-y-4 pt-4 border-t border-border/50">
                        <h3 className="font-black text-lg uppercase tracking-widest text-primary">Amenities High-End</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {['Piscina de Borde Infinito • Piso 21', 'Sky Gym con vista al Río', 'Work & Lounge Oasis', 'Seguridad Presencial 24/7', 'Rooftop Lounge & Mixology Bar', 'Cava Privada de Vinos'].map((item, i) => (
                                <div key={i} className="flex items-center p-3 rounded-2xl bg-secondary/20 border border-border/50 group hover:border-primary/50 transition-colors">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(var(--primary),0.8)]" /> 
                                    <span className="text-xs font-black text-foreground/80 uppercase tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>


    </div>
  )
}
