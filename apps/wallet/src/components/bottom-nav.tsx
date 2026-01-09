"use client";

import {
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ArrowLeftRight,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { VestLogo } from "@repo/ui/components/brand/vest-logo";

export function BottomNav() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] =
    useState(false);

  useEffect(() => {
    const handleStoryActive = (
      e: Event
    ) => {
      setIsHidden(
        (e as CustomEvent).detail
      );
    };

    window.addEventListener(
      "story-active",
      handleStoryActive
    );
    return () =>
      window.removeEventListener(
        "story-active",
        handleStoryActive
      );
  }, []);

  const isActive = (path: string) =>
    pathname === path;

  const leftNavItems = [
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

  const rightNavItems = [
    {
      href: "/chat",
      label: "Chat",
      icon: MessageSquare,
    },
    {
      href: "/assets",
      label: "Wallet",
      icon: Wallet,
    },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg pb-safe z-50 transition-transform duration-300",
        isHidden
          ? "translate-y-full"
          : "translate-y-0"
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2 relative">
        <div className="flex items-center justify-around w-full mr-12">
          {leftNavItems.map((item) => {
            const active = isActive(
              item.href
            );
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link
            href="/"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-background border shadow-lg transition-transform hover:scale-105 active:scale-95 overflow-hidden"
          >
            <VestLogo className="w-12 h-12" />
          </Link>
        </div>

        <div className="flex items-center justify-around w-full ml-12">
          {rightNavItems.map((item) => {
            const active = isActive(
              item.href
            );
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
