import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Switch } from "@repo/ui/components/ui/switch";
import { Bell, ChevronRight, CreditCard, LogOut, Shield, User, Wallet, Moon, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>

      {/* Profile Header */}
      <div className="flex items-center gap-4 py-2">
        <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
            <h2 className="text-xl font-bold">Facundo Fierro</h2>
            <p className="text-sm text-muted-foreground">facundo@example.com</p>
            <div className="mt-2 flex gap-2">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Verificado</span>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-medium">Nivel 2</span>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Account Section */}
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground ml-1">Cuenta</h3>
            <Card>
                <CardContent className="p-0 divide-y">
                     <Link href="#" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Datos Personales</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     </Link>
                     <Link href="#" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Billeteras Conectadas</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     </Link>
                     <Link href="#" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Seguridad y Privacidad</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     </Link>
                </CardContent>
            </Card>
        </div>

        {/* Preferences Section */}
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground ml-1">Preferencias</h3>
            <Card>
                <CardContent className="p-0 divide-y">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Notificaciones</span>
                        </div>
                        <Switch />
                    </div>
                     <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Moon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Modo Oscuro</span>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>

         {/* Support Section */}
         <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground ml-1">Soporte</h3>
            <Card>
                <CardContent className="p-0 divide-y">
                    <Link href="#" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Ayuda y Soporte</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                     <Link href="#" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Términos y Condiciones</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>
        </div>
        
        <Button variant="destructive" className="w-full flex items-center gap-2 mt-6 h-12" asChild>
            <Link href="/login">
                <LogOut className="h-4 w-4" /> Cerrar Sesión
            </Link>
        </Button>
         <p className="text-center text-xs text-muted-foreground pt-4 pb-8">Versión 1.0.0 (Beta)</p>
      </div>
    </div>
  );
}
