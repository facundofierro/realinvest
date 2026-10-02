"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { VestRealState } from "@repo/ui/components/brand/vest-real-state";

// Upper bound for the boot splash so a slow first request never holds it forever.
const MAX_SPLASH_MS = 2500;
const FADE_MS = 300;

// Boot-only overlay: shown until the first data load settles, then never again.
// Children are always rendered so background fetches never unmount the app.
export function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [booted, setBooted] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!isMounted || booted) return;
    const finishWhenIdle = () => {
      if (queryClient.isFetching() === 0) setBooted(true);
    };
    // Cache events can fire while another component renders (useQuery adds its
    // query during render), so never set state synchronously from the listener.
    let pendingCheck: ReturnType<typeof setTimeout> | undefined;
    const scheduleCheck = () => {
      clearTimeout(pendingCheck);
      pendingCheck = setTimeout(finishWhenIdle, 0);
    };
    const unsubscribe = queryClient.getQueryCache().subscribe(scheduleCheck);
    // Deferred first check so queries started by children on mount are counted.
    scheduleCheck();
    const maxWait = setTimeout(() => setBooted(true), MAX_SPLASH_MS);
    return () => {
      unsubscribe();
      clearTimeout(pendingCheck);
      clearTimeout(maxWait);
    };
  }, [queryClient, isMounted, booted]);

  useEffect(() => {
    if (!booted) return;
    const timeout = setTimeout(() => setRemoved(true), FADE_MS);
    return () => clearTimeout(timeout);
  }, [booted]);

  const visible = !isMounted || !booted;

  return (
    <>
      {children}
      {!removed && (
        <div
          aria-hidden={!visible}
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300 ${
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="animate-pulse">
            <VestRealState theme="dark" />
          </div>
        </div>
      )}
    </>
  );
}
