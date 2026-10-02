import { Faq } from "@/components/faq";
import { Section, SectionHeading } from "@/components/section";
import { faq } from "@/content/es";

export function FaqSection() {
  return (
    <Section containerClassName="max-w-[860px]">
      <SectionHeading eyebrow={faq.eyebrow} title={faq.title} className="mb-8" />
      <Faq items={faq.items} />
    </Section>
  );
}
