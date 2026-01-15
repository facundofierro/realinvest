"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const fadeInOut = (p: number, start: number, end: number, edge: number) => {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  if (p <= start - edge || p >= end + edge) return 0;
  if (p < start) return clamp01((p - (start - edge)) / edge);
  if (p > end) return clamp01((end + edge - p) / edge);
  return 1;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface ScrollVideoSectionProps {
  videoSectionRef: React.RefObject<HTMLElement | null>;
}

export default function ScrollVideoSection({
  videoSectionRef,
}: ScrollVideoSectionProps) {
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoVisibility, setVideoVisibility] = useState(0);

  useEffect(() => {
    const sectionEl = videoSectionRef.current;
    if (!sectionEl) return;

    const findScrollParent = () => {
      const isScrollable = (el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        return (
          (overflowY === "auto" || overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight
        );
      };

      let el: HTMLElement | null = sectionEl.parentElement;
      while (el && el !== document.body) {
        if (isScrollable(el)) return el;
        el = el.parentElement;
      }
      return null;
    };

    const scrollParent = findScrollParent();

    const getProgress = () => {
      const rect = sectionEl.getBoundingClientRect();

      if (!scrollParent) {
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const sectionTop = scrollY + rect.top;
        const totalScrollableDistance = Math.max(rect.height - windowHeight, 1);
        return clamp01((scrollY - sectionTop) / totalScrollableDistance);
      }

      const containerRect = scrollParent.getBoundingClientRect();
      const containerHeight = scrollParent.clientHeight;
      const scrollTop = scrollParent.scrollTop;

      const sectionTop = scrollTop + (rect.top - containerRect.top);
      const totalScrollableDistance = Math.max(
        rect.height - containerHeight,
        1,
      );

      return clamp01((scrollTop - sectionTop) / totalScrollableDistance);
    };

    const getVisibility = () => {
      const rect = sectionEl.getBoundingClientRect();
      const viewportTop = scrollParent
        ? scrollParent.getBoundingClientRect().top
        : 0;
      const viewportBottom = scrollParent
        ? scrollParent.getBoundingClientRect().bottom
        : window.innerHeight;
      const viewportHeight = scrollParent
        ? scrollParent.clientHeight
        : window.innerHeight;
      const visiblePx =
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop);
      return clamp01(visiblePx / viewportHeight);
    };

    const handleScroll = () => {
      setVideoProgress(getProgress());
      setVideoVisibility(getVisibility());
    };

    handleScroll();
    if (scrollParent) {
      scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("resize", handleScroll);
    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const overallFade = clamp01(videoVisibility / 0.18);
  const title1Opacity = fadeInOut(videoProgress, 0.0, 0.1, 0.05) * overallFade;
  const video1Opacity = fadeInOut(videoProgress, 0.2, 0.35, 0.05) * overallFade;
  const title2Opacity =
    fadeInOut(videoProgress, 0.45, 0.65, 0.05) * overallFade;
  const video2Opacity = fadeInOut(videoProgress, 0.75, 0.9, 0.05) * overallFade;
  const title3Opacity =
    fadeInOut(videoProgress, 0.95, 1.0, 0.025) * overallFade;

  return (
    <div className="relative w-full aspect-[16/9] bg-white overflow-hidden rounded-2xl shadow-2xl border border-gray-100">
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: video1Opacity }}
      >
        <Image
          src="/landing/tokenization-process.png"
          alt="Tokenization Process"
          fill
          className="object-cover animate-ken-burns"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: video2Opacity }}
      >
        <Image
          src="/landing/tokenization-process.png"
          alt="Tokenization Management"
          fill
          className="object-cover animate-ken-burns"
          style={{ animationDirection: "reverse" }}
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t pointer-events-none from-white/90 via-white/20 to-white/60" />

      <div className="flex absolute inset-0 justify-center items-center px-6 pointer-events-none sm:px-10">
        <div
          className="max-w-2xl text-center"
          style={{
            opacity: title1Opacity,
          }}
        >
          <p className="text-xs font-semibold tracking-wide text-[#5B1187] uppercase">
            Producto
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#3B2146] sm:text-4xl text-pretty">
            Descubrí la experiencia VEST
          </h2>
        </div>

        <div
          className="absolute max-w-2xl text-center"
          style={{
            opacity: title2Opacity,
          }}
        >
          <p className="text-xs font-semibold tracking-wide text-[#5B1187] uppercase">
            Flujo
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#3B2146] sm:text-4xl text-pretty">
            Gestión clara, simple y regulada
          </h2>
        </div>

        <div
          className="absolute max-w-2xl text-center"
          style={{
            opacity: title3Opacity,
          }}
        >
          <p className="text-xs font-semibold tracking-wide text-[#5B1187] uppercase">
            Escala
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#3B2146] sm:text-4xl text-pretty">
            Listo para captar más inversores
          </h2>
        </div>
      </div>

      <div className="flex gap-2 justify-center mt-6 absolute bottom-8 left-0 right-0 z-20">
        <div
          className="h-1.5 w-8 rounded-full bg-[#5B1187]"
          style={{
            opacity: clamp01(title1Opacity * 1.2),
          }}
        />
        <div
          className="h-1.5 w-8 rounded-full bg-[#5B1187]"
          style={{
            opacity: clamp01(video1Opacity * 1.2),
          }}
        />
        <div
          className="h-1.5 w-8 rounded-full bg-[#5B1187]"
          style={{
            opacity: clamp01(title2Opacity * 1.2),
          }}
        />
        <div
          className="h-1.5 w-8 rounded-full bg-[#5B1187]"
          style={{
            opacity: clamp01(video2Opacity * 1.2),
          }}
        />
        <div
          className="h-1.5 w-8 rounded-full bg-[#5B1187]"
          style={{
            opacity: clamp01(title3Opacity * 1.2),
          }}
        />
      </div>
    </div>
  );
}
