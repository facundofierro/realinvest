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
}: {
  src: string;
  alt: string;
  /** Source height in px (width is always 780). */
  height?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border-[1px] border-[#2A1634] bg-[#2A1634]",
        className,
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
  );
}
