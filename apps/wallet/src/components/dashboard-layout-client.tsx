"use client";

import { useIsDesktop } from "@/hooks/use-is-desktop";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState } from "react";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering nothing or a loader until mounted?
  // Or just accept that server renders mobile first.
  // We'll render mobile structure by default to match server.
  
  if (!mounted) {
      // Default to mobile view matching server
      return (
        <div className="flex flex-col min-h-screen bg-muted/5">
            <main className="flex-1 pb-24">
                {children}
            </main>
            <BottomNav />
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-muted/5 transition-all duration-300">
      {isDesktop ? <DesktopSidebar /> : null}

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isDesktop ? "pl-64" : "pb-24" // Sidebar width push or BottomNav padding
        )}
      >
        <main className="flex-1 p-4 md:p-6">
            {children}
        </main>
        
        {!isDesktop && <BottomNav />}
      </div>
    </div>
  );
}
