import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import Link from "next/link";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex overflow-hidden relative justify-center items-center p-4 min-h-screen bg-muted/20">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-sm border-none shadow-2xl backdrop-blur-md bg-background/80">
        <CardHeader className="pb-8 space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl ring-1 bg-primary/10 ring-primary/20">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Real Invest
          </CardTitle>
          <CardDescription className="text-base">
            Bienvenido a tu portal de
            activos reales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">
                Contraseña
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              className="h-11"
            />
          </div>
          <Button className="w-full h-11">
            Iniciar Sesión
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              ¿No tienes una cuenta?{" "}
            </span>
            <Link
              href="/register"
              className="text-primary hover:underline"
            >
              Regístrate
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="text-xs text-center text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <Link
              href="/terms"
              className="underline hover:text-primary"
            >
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link
              href="/privacy"
              className="underline hover:text-primary"
            >
              Política de Privacidad
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}