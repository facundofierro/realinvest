import { CtaLink } from "@/components/cta-link";
import { Skyline } from "@/components/illustrations/skyline";
import { Section, SectionHeading } from "@/components/section";
import { DemoForm } from "@/components/sections/demo-form";
import { contactEnv, finalCta } from "@/content/es";

export function FinalCta() {
  return (
    <Section
      id="demo"
      tone="dark"
      containerClassName="grid items-start gap-14 lg:grid-cols-2"
    >
      <div>
        <SectionHeading
          dark
          eyebrow={finalCta.eyebrow}
          title={finalCta.title}
          lead={finalCta.text}
          titleClassName="max-w-[14ch]"
        />
        {contactEnv.whatsappUrl && (
          <CtaLink
            href={contactEnv.whatsappUrl}
            variant="lightGhost"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7"
          >
            {finalCta.whatsappCta.label}
          </CtaLink>
        )}
        <Skyline className="mt-12 hidden h-auto w-full sm:block" />
      </div>
      <DemoForm privacyUrl={contactEnv.privacyUrl} />
    </Section>
  );
}
