import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "light" | "lightGhost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  ghost:
    "text-brand shadow-[inset_0_0_0_1.5px_var(--color-brand)] hover:bg-tint",
  light: "bg-white text-ink hover:bg-tint",
  lightGhost:
    "text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10",
};

/** Pill button classes, shared by anchors and the form submit button. */
export function ctaClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-center text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    className,
  );
}

/** Button-styled anchor (defaults to the demo form). */
export function CtaLink({
  href = "#demo",
  variant = "primary",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: Variant }) {
  return <a href={href} className={ctaClass(variant, className)} {...props} />;
}
