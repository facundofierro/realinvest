"use client";

import { useEffect, useRef } from "react";

type CardVideoProps = {
  /** Clip name(s) under /videos; several clips play one after another. */
  name: string | string[];
  poster: string;
  label: string;
  width: number;
  height: number;
  className?: string;
  /** Seconds to fade in/out at the ends of each loop (0 = plain loop). */
  fade?: number;
  /** Milliseconds of blank pause between runs/clips. */
  gap?: number;
};

// Muted looping card video: plays only while visible, stays on the poster
// for users who prefer reduced motion.
export function CardVideo({
  name,
  poster,
  label,
  width,
  height,
  className,
  fade = 0,
  gap = 500,
}: CardVideoProps) {
  const names = Array.isArray(name) ? name : [name];
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) return;
    video.preload = "metadata";

    // Soft loop: opacity ramps in/out around each loop, with a short blank
    // pause before the next run, instead of a hard cut.
    let frame = 0;
    let index = 0;
    let timer = 0;
    const tick = () => {
      const { currentTime, duration } = video;
      if (duration) {
        const edge = Math.min(currentTime, duration - currentTime) / fade;
        video.style.opacity = String(Math.max(0, Math.min(1, edge)));
      }
      frame = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    const onPause = () => cancelAnimationFrame(frame);
    const onEnded = () => {
      video.style.opacity = "0";
      timer = window.setTimeout(() => {
        if (names.length > 1) {
          index = (index + 1) % names.length;
          const ext = video.canPlayType("video/webm") ? "webm" : "mp4";
          video.src = `/videos/${names[index]}.${ext}`;
        } else {
          video.currentTime = 0;
        }
        void video.play().catch(() => {});
      }, gap);
    };
    if (fade > 0) {
      video.style.opacity = "0";
      video.addEventListener("play", onPlay);
      video.addEventListener("pause", onPause);
      video.addEventListener("ended", onEnded);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fade]);

  return (
    <video
      ref={ref}
      muted
      loop={fade === 0 && names.length === 1}
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      width={width}
      height={height}
      className={className}
    >
      <source src={`/videos/${names[0]}.webm`} type="video/webm" />
      <source src={`/videos/${names[0]}.mp4`} type="video/mp4" />
    </video>
  );
}
