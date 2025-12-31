"use client";

import { useEffect, useState } from "react";

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth > window.innerHeight);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Return false during SSR or before mount to match server state (mobile by default)
  if (!hasMounted) return false;

  return isDesktop;
}
