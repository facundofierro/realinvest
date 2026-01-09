"use client";

import { useSyncExternalStore } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";

export function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFetching = useIsFetching();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isLoading =
    !isMounted || isFetching > 0;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300">
        <div className="animate-pulse">
          <VestRealState theme="dark" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
