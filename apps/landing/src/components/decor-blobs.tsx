import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Blob = {
  /** Position and size, e.g. "-left-24 top-10 size-[380px]". */
  className: string;
  /** Scroll travel in px; negative moves slower than the content. */
  drift?: number;
};

const lightColors = ["bg-[#EAD7F5]/60", "bg-[#D9B8EE]/40"];

/**
 * Decorative blurred circles that drift on scroll (md and up). Meant for the
 * `background` slot of `Section`, whose className then needs
 * `relative isolate overflow-clip`.
 */
export function DecorBlobs({
  blobs,
  dark = false,
  className,
  children,
}: {
  blobs: Blob[];
  dark?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 hidden overflow-clip md:block",
        className,
      )}
    >
      {children}
      {blobs.map((blob, i) => (
        <div
          key={blob.className}
          className={cn(
            "parallax-drift absolute rounded-full blur-3xl",
            dark ? "bg-[#5B1187]/25" : lightColors[i % lightColors.length],
            blob.className,
          )}
          style={{ "--drift": `${blob.drift ?? -120}px` } as CSSProperties}
        />
      ))}
    </div>
  );
}
