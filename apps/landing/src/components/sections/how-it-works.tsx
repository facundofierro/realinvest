import type { CSSProperties } from "react";
import Image from "next/image";
import { CtaLink } from "@/components/cta-link";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { howItWorks } from "@/content/es";
import { cn } from "@/lib/utils";

const images = [
  "/images/step-demo.webp",
  "/images/step-setup.webp",
  "/images/step-launch.webp",
  "/images/step-operation.webp",
];

export function HowItWorks() {
  const { pricing } = howItWorks;
  return (
    <Section id="como-funciona" tone="white">
      <SectionHeading eyebrow={howItWorks.eyebrow} title={howItWorks.title} />
      <ol className="mb-7 mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorks.steps.map((step, i) => (
          <li
            key={step.title}
            className="group/step parallax-rise"
            style={{ "--rise": `${40 + i * 20}px` } as CSSProperties}
          >
            <div
              className={cn(
                cardClass,
                "h-full bg-background",
                "motion-safe:transition-[translate,box-shadow] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                "shadow-[0_0_0_0_rgba(75,16,128,0)] motion-safe:group-hover/step:-translate-y-1 group-hover/step:shadow-[0_16px_32px_-14px_rgba(75,16,128,0.25)]",
              )}
            >
              <Image
                src={images[i]}
                alt=""
                width={256}
                height={256}
                className="mb-3 size-[84px] flex-none motion-safe:transition-[scale] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/step:scale-105"
              />
              <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
                {i + 1} · {step.title}
              </h3>
              <p className="text-[15.5px] text-muted-foreground">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div
        className={cn(
          cardClass,
          "flex flex-wrap items-center justify-between gap-6 border-[1.5px] border-brand",
        )}
      >
        <div className="max-w-[70ch]">
          <h3 className="mb-2 text-2xl font-semibold tracking-[-0.01em]">
            {pricing.title}
          </h3>
          <p className="text-[15.5px] text-muted-foreground">{pricing.text}</p>
        </div>
        <CtaLink href={howItWorks.cta.href}>{howItWorks.cta.label}</CtaLink>
      </div>
    </Section>
  );
}
