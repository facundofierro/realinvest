"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ArrowLeftRight,
  MessageSquare,
  Wallet,
  User,
  Blocks,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { formatCurrency } from "@/lib/format";
import { useWalletBalances } from "@/hooks/use-queries";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";
import { Button } from "@repo/ui/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";

export function DesktopTopNav() {
  const pathname = usePathname();
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
    },
    {
      href: "/exchange",
      label: "Exchange",
      icon: ArrowLeftRight,
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
            className="origin-left scale-[0.65] border-none shadow-none p-0"
          />
        </Link>

        <nav className="flex gap-6 items-center h-14">
          {mainLinks.map((link) => {
            const active = isActive(
              link.href
            );
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 h-full px-1 group transition-colors",
                  active
                    ? "text-[#5B1187]"
                    : "text-muted-foreground hover:text-[#5B1187]"
                )}
              >
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

        <div className="flex gap-2 items-center pl-2 ml-2 border-l">
          <span className="text-sm font-medium">
            Usuario
          </span>
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              CN
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
