"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ArrowLeftRight,
  MessageSquare,
  Wallet,
  User,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";
import { Button } from "@repo/ui/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";

export function DesktopTopNav() {
  const pathname = usePathname();

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
  ];

  return (
    <header className="flex fixed top-0 right-0 left-0 z-50 justify-between items-center px-6 h-16 border-b backdrop-blur-lg bg-background/80">
      <div className="flex gap-8 items-center">
        <Link href="/">
          <VestRealState
            theme="light"
            className="origin-left scale-75"
          />
        </Link>

        <nav className="flex gap-1 items-center">
          {mainLinks.map((link) => {
            const active = isActive(
              link.href
            );
            return (
              <Button
                key={link.href}
                variant={
                  active
                    ? "secondary"
                    : "ghost"
                }
                asChild
                className={cn(
                  "gap-2",
                  active &&
                    "bg-secondary"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="w-4 h-4" />
                  <span>
                    {link.label}
                  </span>
                </Link>
              </Button>
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

        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-sm font-medium">
            $12,450.00
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
