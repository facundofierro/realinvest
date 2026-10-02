import type { ComponentType } from "react";
import { CtaLink } from "@/components/cta-link";
import {
  Service3d,
  ServiceCrm,
  ServiceSetup,
} from "@/components/illustrations/services";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { services } from "@/content/es";

const illustrations: Record<
  (typeof services.cards)[number]["key"],
  ComponentType<{ className?: string }>
> = {
  setup: ServiceSetup,
  "3d": Service3d,
  crm: ServiceCrm,
};

export function Services() {
  return (
    <Section id="servicios">
      <SectionHeading
        eyebrow={services.eyebrow}
        title={services.title}
        lead={services.text}
        className="mb-10"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {services.cards.map((card) => {
          const Illustration = illustrations[card.key];
          return (
            <div key={card.key} className={cardClass}>
              <Illustration className="mb-4 block h-auto w-full" />
              <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
                {card.title}
              </h3>
              <p className="text-[15.5px] text-muted-foreground">{card.text}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
        <p className="max-w-[60ch] text-sm text-[#6B5A74]">{services.scopeNote}</p>
        <CtaLink href={services.cta.href} variant="ghost">
          {services.cta.label}
        </CtaLink>
      </div>
    </Section>
  );
}
