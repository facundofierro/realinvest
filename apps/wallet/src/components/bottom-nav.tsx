"use client";

import {
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { VestLogo } from "@repo/ui/components/brand/vest-logo";
import { AccountOverlay } from "@/components/account-overlay";
import {
  BOTTOM_LEFT_ITEMS,
  BOTTOM_RIGHT_ITEMS,
  isNavActive,
} from "@/components/nav/nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] =
    useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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

  const leftNavItems = BOTTOM_LEFT_ITEMS;
  const rightNavItems = BOTTOM_RIGHT_ITEMS;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300 pb-safe",
        isHidden
          ? "translate-y-[calc(100%+env(safe-area-inset-bottom))]"
          : "translate-y-0"
      )}
    >
     <div className="relative mx-auto w-full max-w-md">
      <div className="absolute inset-0 -top-4 short:-top-2 pointer-events-none">
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
            d="M0,100 L0,35 Q0,20 15,20 L80,20 Q115,20 145,10 Q187.5,-15 230,10 Q260,20 295,20 L360,20 Q375,20 375,35 L375,100 Z"
            fill="rgba(255, 255, 255, 0.95)"
          />
          {/* Purple Border Line (Top and Sides only) */}
          <path
            d="M0,100 L0,35 Q0,20 15,20 L80,20 Q115,20 145,10 Q187.5,-15 230,10 Q260,20 295,20 L360,20 Q375,20 375,35 L375,100"
            fill="none"
            stroke="#5B1187"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#purple-glow)"
          />
        </svg>
      </div>

      <nav className="flex relative justify-around items-center pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-3 h-16 short:pt-1 short:h-12">
        <div className="flex z-10 justify-around items-center mr-12 short:mr-8 w-full">
          {leftNavItems.map((item) => {
            const active = isNavActive(
              pathname,
              item.href
            );
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col justify-center items-center space-y-1 w-full h-full transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium short:sr-only">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div
          className="absolute left-1/2 z-20 pl-2 -translate-x-1/2 top-[-1.3rem] short:top-[-0.6rem]"
        >
          <Link
            href="/"
            className="flex justify-center items-center w-32 h-24 short:w-20 short:h-14 transition-transform hover:scale-105 active:scale-95"
          >
            <VestLogo
              className="w-36 h-36 short:w-20 short:h-20"
              showSubtitle={false}
            />
          </Link>
        </div>

        <div className="flex z-10 justify-around items-center ml-12 short:ml-8 w-full">
          {rightNavItems.map((item) => {
            const active = isNavActive(
              pathname,
              item.href
            );
            const Icon = item.icon;

            if (item.href === "#account") {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setAccountOpen(true)}
                  className="flex flex-col justify-center items-center space-y-1 w-full h-full text-muted-foreground hover:text-foreground"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium short:sr-only">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col justify-center items-center space-y-1 w-full h-full transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium short:sr-only">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AccountOverlay
        open={accountOpen}
        onOpenChange={setAccountOpen}
      />
     </div>
    </div>
  );
}
