import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "ground" | "white" | "dark";

const toneClasses: Record<Tone, string> = {
  ground: "bg-background",
  white: "bg-white",
  dark: "bg-dark-band text-white",
};

export const cardClass =
  "rounded-[20px] border border-card-border bg-card p-7";

export function Section({
  id,
  tone = "ground",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-[68px] py-16 md:py-24",
        toneClasses[tone],
        className,
      )}
    >
      <div
        className={cn("mx-auto w-full max-w-[1180px] px-6", containerClassName)}
      >
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={cn(
        "mb-3.5 font-mono text-xs font-medium uppercase tracking-[0.12em]",
        dark ? "text-[#D9B8EE]" : "text-brand",
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  dark = false,
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  dark?: boolean;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mb-[18px] max-w-[20ch] text-balance text-[clamp(30px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em]",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "max-w-[60ch] text-lg",
            dark ? "text-dark-text" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

function CheckMark({ dark }: { dark: boolean }) {
  return (
    <svg
      className="mt-[3px] flex-none"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="10"
        fill={dark ? "rgba(255,255,255,0.12)" : "#EAD7F5"}
      />
      <path
        d="M6 10.5l2.7 2.7L14 7.8"
        stroke={dark ? "#E9CFFA" : "#5B1187"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckList({
  items,
  dark = false,
  className,
}: {
  items: readonly ReactNode[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckMark dark={dark} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
