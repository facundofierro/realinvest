"use client";

import { useSyncExternalStore } from "react";
import {
  NAV_SWITCH_BREAKPOINT,
  OVERLAY_SWITCH_BREAKPOINT,
  minWidthQuery,
} from "@/lib/breakpoints";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () =>
        mql.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** True when the top nav (laptop+) layout is active. */
export function useIsNavDesktop() {
  return useMediaQuery(minWidthQuery(NAV_SWITCH_BREAKPOINT));
}

/** True when overlays render as centered dialogs (tablet+) instead of sheets. */
export function useIsOverlayDialog() {
  return useMediaQuery(minWidthQuery(OVERLAY_SWITCH_BREAKPOINT));
}
