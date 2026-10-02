import { CtaLink } from "@/components/cta-link";
import { IconTile, type IconName } from "@/components/illustrations/icons";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { howItWorks } from "@/content/es";
import { cn } from "@/lib/utils";

const icons: IconName[] = ["monitor", "gear", "flag", "headset"];

export function HowItWorks() {
  const { pricing } = howItWorks;
  return (
    <Section id="como-funciona" tone="white">
      <SectionHeading eyebrow={howItWorks.eyebrow} title={howItWorks.title} />
      <ol className="mb-7 mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorks.steps.map((step, i) => (
          <li key={step.title} className={cn(cardClass, "bg-background")}>
            <IconTile name={icons[i]} className="mb-4" />
            <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
              {i + 1} · {step.title}
            </h3>
            <p className="text-[15.5px] text-muted-foreground">{step.text}</p>
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
