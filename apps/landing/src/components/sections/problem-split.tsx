"use client";

import Image from "next/image";
import { useState } from "react";

const before = {
  src: "/images/problem-before.webp",
  alt: "Compradores y asesor entre pilas de folletos y planos desordenados",
};
const after = {
  src: "/images/problem-after.webp",
  alt: "Compradores y asesor mirando juntos el inventario ordenado en una tablet",
};

// The photos are taller than the frame and drift inside it on scroll.
const drift = { "--drift": "4%" } as React.CSSProperties;
const driftBox = "parallax-drift absolute inset-x-0 -inset-y-[8%]";

// Divider x position (% of width) at mid-height, and how far it travels.
const MID = 36;
const SHIFT = 8;

export function ProblemSplit() {
  const [shift, setShift] = useState(0);

  return (
    <div
      className="relative aspect-[2/1] overflow-clip sm:aspect-[17/5]"
      style={{ "--shift": `${shift}%` } as React.CSSProperties}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setShift(x < MID + shift ? SHIFT : -SHIFT);
      }}
      onPointerLeave={() => setShift(0)}
    >
      <div className="absolute inset-y-0 right-0 w-[80%]">
        <div className={driftBox} style={drift}>
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="(min-width: 1180px) 880px, 80vw"
            className="object-cover object-right"
          />
        </div>
      </div>
      <div className="absolute inset-0 transition-[clip-path] duration-500 ease-out [clip-path:polygon(0_0,calc(40%+var(--shift))_0,calc(32%+var(--shift))_100%,0_100%)] motion-reduce:transition-none">
        <div className={driftBox} style={drift}>
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(min-width: 1180px) 1100px, 100vw"
            className="object-cover object-left"
          />
        </div>
      </div>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full translate-x-[var(--shift)] drop-shadow-md transition-transform duration-500 ease-out motion-reduce:transition-none"
      >
        <line
          x1="40"
          y1="0"
          x2="32"
          y2="100"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
