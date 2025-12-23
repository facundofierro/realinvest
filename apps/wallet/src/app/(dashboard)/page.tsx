import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Building2, TrendingUp, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Hola, Facundo</h1>
           <p className="text-sm text-muted-foreground">Bienvenido de nuevo</p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
             </Button>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>
      </header>

      {/* Balance Card */}
      <Card className="bg-linear-to-br from-gray-900 via-slate-900 to-violet-950 text-white border-none shadow-xl relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
         <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
         
         <CardContent className="p-6 space-y-4 relative z-10">
            <div className="space-y-1">
                <span className="text-primary-foreground/80 text-sm font-medium">Balance Total</span>
                 <div className="text-4xl font-bold tracking-tighter">$ 124,500.00</div>
                 <div className="flex items-center text-accent text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12.5% este mes
                 </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <Button className="w-full bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 border-0 backdrop-blur-sm h-12" asChild>
                    <Link href="/deposit">
                        <ArrowDownLeft className="mr-2 h-4 w-4" /> Ingresar
                    </Link>
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 border-0 backdrop-blur-sm h-12" asChild>
                     <Link href="/withdraw">
                        <ArrowUpRight className="mr-2 h-4 w-4" /> Retirar
                     </Link>
                </Button>
            </div>
         </CardContent>
      </Card>

      {/* Hot Projects */}
      <section className="space-y-3">
         <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Oportunidades Destacadas</h2>
            <Link href="/search" className="text-sm text-primary font-medium hover:underline">Ver todas</Link>
         </div>
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4 scrollbar-hide">
            {/* Project Card 1 */}
            <div className="min-w-[280px] snap-center">
                <Link href="/project/1">
                <Card className="overflow-hidden border-none shadow-lg group">
                    <div className="h-32 bg-slate-200 relative">
                         <Image 
                            src="/projects/torre-libertador.png"
                            alt="Torre Libertador 8000"
                            fill
                            className="object-cover"
                         />
                         <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                         <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                            En Construcción
                         </div>
                    </div>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">Torre Libertador 8000</h3>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <Building2 className="h-3 w-3 mr-1" /> Nuñez, Buenos Aires
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-primary">12%</span>
                                <span className="text-[10px] text-muted-foreground uppercase">TIR Est.</span>
                            </div>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-primary h-full w-[65%]" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Recaudado: 65%</span>
                            <span>Meta: $2M</span>
                        </div>
                    </CardContent>
                </Card>
                </Link>
            </div>
             {/* Project Card 2 */}
            <div className="min-w-[280px] snap-center">
                <Card className="overflow-hidden border-none shadow-lg group">
                     <div className="h-32 bg-slate-200 relative">
                          <Image 
                            src="/projects/barrio-el-ceibo.png"
                            alt="Barrio Privado El Ceibo"
                            fill
                            className="object-cover"
                         />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                          <div className="absolute top-2 right-2 bg-accent/90 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm shadow-accent/20">
                             Pre-Venta
                          </div>
                     </div>
                    <CardContent className="p-4">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">Barrio Privado "El Ceibo"</h3>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <Building2 className="h-3 w-3 mr-1" /> Pilar, Buenos Aires
                                </p>
                            </div>
                             <div className="text-right">
                                <span className="block font-bold text-primary">18%</span>
                                <span className="text-[10px] text-muted-foreground uppercase">TIR Est.</span>
                            </div>
                        </div>
                         <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-primary h-full w-[30%]" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Recaudado: 30%</span>
                            <span>Meta: $5M</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
         </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                            {i === 1 ? <ArrowDownLeft className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{i === 1 ? "Depósito USD" : "Compra Token Torre L."}</p>
                            <p className="text-xs text-muted-foreground">Hoy, 10:23 AM</p>
                        </div>
                    </div>
                    <div className={`font-semibold text-sm ${i === 1 ? "text-primary" : ""}`}>
                        {i === 1 ? "+ $1,000.00" : "- $500.00"}
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  )
}
