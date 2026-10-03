import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A real app screenshot (390px wide @2x, in public/images) inside a CSS phone frame.
 */
export function PhoneScreenshot({
  src,
  alt,
  height = 1688,
  sizes,
  priority,
  className,
  frameClassName,
}: {
  src: string;
  alt: string;
  /** Source height in px (width is always 780). */
  height?: number;
  sizes: string;
  priority?: boolean;
  /** Wrapper classes (width). The wrapper is the stable hover target. */
  className?: string;
  /** Frame classes (shadow). The frame lifts on hover. */
  frameClassName?: string;
}) {
  return (
    <div className={cn("group/phone", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-[28px] border-[1px] border-[#2A1634] bg-[#2A1634]",
          "motion-safe:transition-[translate,box-shadow] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-safe:group-hover/phone:-translate-y-1",
          frameClassName,
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={780}
          height={height}
          sizes={sizes}
          priority={priority}
          className="block h-auto w-full rounded-[27px]"
        />
      </div>
    </div>
  );
}
