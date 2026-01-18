"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ArrowLeftRight,
  MessageSquare,
  Wallet,
  Blocks,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { formatCurrency } from "@/lib/format";
import { useWalletBalances } from "@/hooks/use-queries";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@repo/ui/components/ui/dialog";

export function DesktopTopNav() {
  const pathname = usePathname();
  const [launchDialogOpen, setLaunchDialogOpen] =
    useState(false);
  const { data: balances = [] } =
    useWalletBalances();

  const availableUsdt =
    balances.find(
      (b) => b.currencyCode === "USDT"
    )?.available ?? 0;

  const isActive = (path: string) =>
    pathname === path;

  const mainLinks = [
    {
      href: "/invest",
      label: "Proyectos",
      icon: Building2,
      blocked: true,
    },
    {
      href: "/exchange",
      label: "Exchange",
      icon: ArrowLeftRight,
      blocked: true,
    },
    {
      href: "/tokenization",
      label: "Tokenización",
      icon: Blocks,
    },
  ];

  return (
    <header className="flex fixed top-0 right-0 left-0 z-50 justify-between items-center px-8 h-14 bg-white border-b">
      <div className="flex gap-12 items-center">
        <Link href="/">
          <VestRealState
            theme="light"
            withColors={true}
            className="origin-left scale-[0.78] border-none shadow-none p-0"
          />
        </Link>

        <nav className="flex gap-6 items-center h-14">
          {mainLinks.map((link) => {
            const active = isActive(
              link.href
            );
            const linkClasses = cn(
              "relative flex items-center gap-2 h-full px-1 group transition-colors",
              active
                ? "text-[#5B1187]"
                : "text-muted-foreground hover:text-[#5B1187]"
            );
            const linkContent = (
              <>
                <link.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {link.label}
                </span>
                {/* Active Underline - Closer to text */}
                <div
                  className={cn(
                    "absolute bottom-[2px] left-0 right-0 h-[2px] bg-[#5B1187] rounded-full transition-all duration-300",
                    active
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100"
                  )}
                />
              </>
            );

            if (link.blocked) {
              return (
                <button
                  key={link.href}
                  type="button"
                  className={linkClasses}
                  onClick={() =>
                    setLaunchDialogOpen(true)
                  }
                  aria-haspopup="dialog"
                >
                  {linkContent}
                </button>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={linkClasses}
              >
                {linkContent}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex gap-4 items-center">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href="/chat">
            <MessageSquare className="w-5 h-5" />
          </Link>
        </Button>

        <div className="flex gap-2 items-center px-1">
          <Wallet className="w-4 h-4 text-muted-foreground/60" />
          <span className="text-sm font-bold tracking-tight text-[#3B2146]">
            {formatCurrency(
              availableUsdt
            )}
          </span>
        </div>

        <div className="flex items-center pl-2 ml-2 border-l">
          <Button
            variant="ghost"
            className="text-sm font-semibold text-[#5B1187] hover:text-[#5B1187] hover:bg-[#5B1187]/5"
            asChild
          >
            <Link href="/login">
              Iniciar Sesión
            </Link>
          </Button>
        </div>
      </div>

      <Dialog
        open={launchDialogOpen}
        onOpenChange={setLaunchDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Disponible en marzo de 2026
            </DialogTitle>
            <DialogDescription>
              Exchange y Proyectos están en
              camino. Regístrate para recibir
              novedades y ser de los primeros en
              acceder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost">
                Cerrar
              </Button>
            </DialogClose>
            <Button asChild>
              <Link href="/register">
                Registrarme
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
