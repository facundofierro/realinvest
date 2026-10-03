"use client";

import { useEffect } from "react";

// Fallback for browsers without CSS scroll-driven animations (Firefox):
// writes the hero exit progress (0 → 1) to --hero-p, which globals.css maps
// onto the hero parallax classes. Does nothing where CSS handles it.
export function ScrollProgress() {
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.querySelector<HTMLElement>(".parallax-hero");
    if (!hero) return;
    const root = document.documentElement;

    let frame = 0;
    const update = () => {
      frame = 0;
      const top = hero.offsetTop;
      const bottom = top + hero.offsetHeight;
      // The hero starts leaving when its top reaches the viewport top or,
      // if it is taller than the viewport, when its bottom comes into view.
      const start = Math.max(top, bottom - window.innerHeight);
      const progress = (window.scrollY - start) / (bottom - start);
      root.style.setProperty(
        "--hero-p",
        String(Math.max(0, Math.min(1, progress))),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--hero-p");
    };
  }, []);

  return null;
}
