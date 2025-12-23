import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import Link from "next/link";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-sm border-none shadow-2xl bg-background/80 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl ring-1 ring-primary/20">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Real Invest</CardTitle>
          <CardDescription className="text-base">
            Bienvenido a tu portal de activos reales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" placeholder="nombre@ejemplo.com" type="email" className="h-11" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <Label htmlFor="password">Contraseña</Label>
               <Link href="#" className="text-xs text-primary hover:underline">¿Olvidaste?</Link>
            </div>
            <Input id="password" type="password" className="h-11" />
          </div>
          <Button className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20" asChild>
            <Link href="/dashboard">
              Iniciar Sesión
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground pt-2">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
             <Button variant="outline" className="w-full">Google</Button>
             <Button variant="outline" className="w-full">Apple</Button>
          </div>
          <div className="text-sm mt-4">
            ¿No tienes cuenta? <Link href="#" className="font-semibold text-primary hover:underline">Regístrate</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
