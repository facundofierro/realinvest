"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Wallet,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { formatCurrency } from "@/lib/format";
import { useWalletBalances } from "@/hooks/use-queries";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AccountOverlay } from "@/components/account-overlay";
import {
  ResponsiveOverlay,
  ResponsiveOverlayClose,
  ResponsiveOverlayDescription,
  ResponsiveOverlayFooter,
  ResponsiveOverlayHeader,
  ResponsiveOverlayTitle,
} from "@/components/responsive-overlay";
import { TOP_MAIN_ITEMS, isNavActive } from "@/components/nav/nav-items";

export function DesktopTopNav() {
  const pathname = usePathname();
  const [launchDialogOpen, setLaunchDialogOpen] =
    useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const { user } = useCurrentUser();
  const { data: balances = [], isLoading: isBalancesLoading } =
    useWalletBalances();

  const availableUsdt =
    balances.find(
      (b) => b.currencyCode === "USDT"
    )?.available ?? 0;

  const mainLinks = TOP_MAIN_ITEMS;

  return (
    <header className="hidden lg:flex fixed top-0 right-0 left-0 z-50 justify-between items-center px-8 h-14 bg-white border-b">
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
            const active = isNavActive(
              pathname,
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
                aria-current={active ? "page" : undefined}
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
          {isBalancesLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className="text-sm font-bold tracking-tight text-[#3B2146]">
              {formatCurrency(
                availableUsdt
              )}
            </span>
          )}
        </div>

        <div className="flex items-center pl-2 ml-2 border-l">
          <Button
            variant="ghost"
            className="gap-2 text-sm font-semibold text-[#5B1187] hover:text-[#5B1187] hover:bg-[#5B1187]/5"
            onClick={() => setAccountDialogOpen(true)}
          >
            {user?.image ? <img alt="" className="h-6 w-6 rounded-full" src={user.image} /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs">{user?.name?.[0] ?? "U"}</span>}
            {user?.name ?? "Cuenta"}
          </Button>
        </div>
      </div>

      <ResponsiveOverlay
        open={launchDialogOpen}
        onOpenChange={setLaunchDialogOpen}
      >
        <ResponsiveOverlayHeader>
          <ResponsiveOverlayTitle>
            Disponible en marzo de 2026
          </ResponsiveOverlayTitle>
          <ResponsiveOverlayDescription>
            Exchange y Proyectos están en
            camino. Regístrate para recibir
            novedades y ser de los primeros en
            acceder.
          </ResponsiveOverlayDescription>
        </ResponsiveOverlayHeader>
        <ResponsiveOverlayFooter className="gap-2 sm:gap-0">
          <ResponsiveOverlayClose asChild>
            <Button variant="ghost">
              Cerrar
            </Button>
          </ResponsiveOverlayClose>
          <Button asChild>
            <Link href="/login">
              Iniciar sesión
            </Link>
          </Button>
        </ResponsiveOverlayFooter>
      </ResponsiveOverlay>

      <AccountOverlay
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
      />
    </header>
  );
}
