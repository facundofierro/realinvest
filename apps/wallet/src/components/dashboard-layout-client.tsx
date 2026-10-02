"use client";

import { BottomNav } from "@/components/bottom-nav";
import { DesktopTopNav } from "@/components/desktop-top-nav";

/**
 * Both navs always mount; CSS breakpoints (lg) pick which is visible so the
 * first paint is correct without waiting for hydration. See lib/breakpoints.ts.
 */
export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-muted/5">
      <DesktopTopNav />

      <div className="flex-1 min-w-0 flex flex-col lg:pt-14">
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
