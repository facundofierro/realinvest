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
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 w-full max-w-md transition-transform duration-300 -translate-x-1/2 pb-safe",
        isHidden
          ? "translate-y-full"
          : "translate-y-0"
      )}
    >
      <div className="absolute inset-0 -top-4 pointer-events-none">
        <svg
          viewBox="0 -20 375 120"
          className="overflow-visible w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <filter
              id="purple-glow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur
                stdDeviation="2"
                result="blur"
              />
              <feFlood
                floodColor="#5B1187"
                floodOpacity="0.4"
                result="color"
              />
              <feComposite
                in="color"
                in2="blur"
                operator="in"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Main Background with Bell Curve and Rounded Top Corners */}
          <path
            d="M0,100 L0,35 Q0,20 15,20 L80,20 Q115,20 130,10 Q162.5,-15 195,10 Q210,20 245,20 L360,20 Q375,20 375,35 L375,100 Z"
            fill="rgba(255, 255, 255, 0.95)"
          />
          {/* Purple Border Line (Top and Sides only) */}
          <path
            d="M0,100 L0,35 Q0,20 15,20 L80,20 Q115,20 130,10 Q162.5,-15 195,10 Q210,20 245,20 L360,20 Q375,20 375,35 L375,100"
            fill="none"
            stroke="#5B1187"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#purple-glow)"
          />
        </svg>
      </div>

      <nav className="flex relative justify-around items-center px-2 pt-3 h-16">
        <div className="flex z-10 justify-around items-center mr-12 w-full">
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
                  "flex flex-col justify-center items-center space-y-1 w-full h-full transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div
          className="absolute left-1/2 z-20 pl-2 -translate-x-1/2"
          style={{ top: "-1.3rem" }}
        >
          <Link
            href="/"
            className="flex justify-center items-center w-32 h-24 transition-transform hover:scale-105 active:scale-95"
          >
            <VestLogo
              className="w-36 h-36"
              showSubtitle={false}
              showBackground={false}
            />
          </Link>
        </div>

        <div className="flex z-10 justify-around items-center ml-12 w-full">
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
                  "flex flex-col justify-center items-center space-y-1 w-full h-full transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
