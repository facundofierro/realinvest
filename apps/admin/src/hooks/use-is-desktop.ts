"use client";

import { useSyncExternalStore } from "react";

export function useIsDesktop() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () =>
        window.removeEventListener(
          "resize",
          onStoreChange
        );
    },
    () => window.innerWidth > window.innerHeight,
    () => false
  );
}
