"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Activity,
  Building2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";

export function AdminDesktopNav() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path;

  const mainLinks = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/activity",
      label: "Actividad",
      icon: Activity,
    },
    {
      href: "/properties",
      label: "Propiedades",
      icon: Building2,
    },
  ];

  return (
    <header className="flex fixed top-0 right-0 left-0 z-50 justify-between items-center px-8 h-14 bg-card border-b border-primary/20">
      <div className="flex gap-12 items-center">
        <Link href="/" className="flex gap-2 items-center">
          <VestRealState
            theme="light"
            withColors={true}
            className="origin-left scale-[0.78] border-none shadow-none p-0"
          />
          <Badge variant="outline" className="ml-2 text-xs border-primary/30 bg-primary/10 text-primary">
            <ShieldCheck className="mr-1 w-3 h-3" />
            Admin
          </Badge>
        </Link>

        <nav className="flex gap-6 items-center h-14">
          {mainLinks.map((link) => {
            const active = isActive(
              link.href
            );
            const linkClasses = cn(
              "relative flex items-center gap-2 h-full px-1 group transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={linkClasses}
              >
                <link.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {link.label}
                </span>
                {/* Active Underline */}
                <div
                  className={cn(
                    "absolute bottom-[2px] left-0 right-0 h-[2px] bg-primary rounded-full transition-all duration-300",
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
      </div>
    </header>
  );
}
