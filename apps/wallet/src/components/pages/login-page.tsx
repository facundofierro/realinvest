import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { signIn } from "@/auth";

export default function LoginPage({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error?: string;
}) {
  async function continueWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

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
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              No pudimos iniciar sesión con Google. Intentá nuevamente.
            </p>
          )}
          <form action={continueWithGoogle}>
            <Button className="w-full h-11" type="submit" variant="outline">
              <svg aria-hidden="true" className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.94v2.79h3.14c1.84-1.69 2.92-4.18 2.92-7.76Z" />
                <path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.79c-.87.59-1.99.94-3.29.94-2.53 0-4.67-1.71-5.44-4.01H3.32v2.88A9.72 9.72 0 0 0 12 21.75Z" />
                <path fill="#FBBC05" d="M6.56 13.53A5.84 5.84 0 0 1 6.25 12c0-.53.09-1.04.31-1.53V7.59H3.32A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.05 1.07 4.41l3.24-2.88Z" />
                <path fill="#EA4335" d="M12 6.46c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.81 3.51 14.62 2.25 12 2.25a9.72 9.72 0 0 0-8.68 5.34l3.24 2.88C7.33 8.17 9.47 6.46 12 6.46Z" />
              </svg>
              Continuar con Google
            </Button>
          </form>
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
