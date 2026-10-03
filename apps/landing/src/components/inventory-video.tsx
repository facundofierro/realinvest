"use client";

import { useEffect, useRef, useState } from "react";

export function InventoryVideo({ label }: { label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    if (query.matches) return;
    video.playbackRate = 0.25;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload={reduced ? "none" : "metadata"}
      poster="/images/inventory-building.webp"
      aria-label={label}
      width={800}
      height={800}
      className="mx-auto block h-auto max-h-[440px] w-auto"
    >
      <source src="/videos/inventory-building.webm" type="video/webm" />
      <source src="/videos/inventory-building.mp4" type="video/mp4" />
    </video>
  );
}
