"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PieChart,
  ArrowLeftRight,
  MessageSquare,
  Plus,
  Wallet,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

export function DesktopSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/assets", label: "Portafolio", icon: PieChart },
    { href: "/invest", label: "Invertir", icon: Plus, isAction: true },
    { href: "/exchange", label: "Exchange", icon: ArrowLeftRight },
    { href: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-background/80 backdrop-blur-lg z-50 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Real Invest</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          
          if (link.isAction) {
             return (
                <div key={link.href} className="px-2 py-4">
                     <Button
                        className="w-full justify-start gap-3 shadow-lg hover:scale-[1.02] transition-transform"
                        asChild
                     >
                        <Link href={link.href}>
                            <Icon className="h-5 w-5" />
                            <span>{link.label}</span>
                        </Link>
                     </Button>
                </div>
             )
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "group-hover:text-foreground")} />
              <span>{link.label}</span>
              {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
          {/* Optional footer content */}
          <div className="text-xs text-muted-foreground text-center">
              Real Invest Wallet v1.0
          </div>
      </div>
    </aside>
  );
}
