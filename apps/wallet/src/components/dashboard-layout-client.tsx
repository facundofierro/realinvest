"use client";

import { useIsDesktop } from "@/hooks/use-is-desktop";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopTopNav } from "@/components/desktop-top-nav";
import { cn } from "@repo/ui/lib/utils";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/5 transition-all duration-300">
      {isDesktop ? (
        <DesktopTopNav />
      ) : null}

      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col transition-all duration-300",
          isDesktop ? "pt-16" : null
        )}
      >
        <main
          className={cn(
            "flex-1 min-h-0 overflow-y-auto overflow-x-hidden",
            isDesktop ? null : "pb-24"
          )}
        >
          {children}
        </main>

        {!isDesktop && <BottomNav />}
      </div>
    </div>
  );
}
