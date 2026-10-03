import type { CSSProperties } from "react";
import Image from "next/image";
import { CtaLink } from "@/components/cta-link";
import { BuildingOutlines } from "@/components/illustrations/building-outlines";
import { Section, SectionHeading } from "@/components/section";
import { DemoForm } from "@/components/sections/demo-form";
import { contactEnv, finalCta } from "@/content/es";

// The skyline's own edges are an opaque vignette that doesn't match the band
// color, so fade every edge to real transparency with two intersected masks.
const skylineMaskImage = [
  "linear-gradient(to bottom, transparent 0%, #000 40%, #000 72%, transparent 100%)",
  "linear-gradient(to right, transparent 0%, #000 12%, #000 55%, transparent 92%)",
].join(", ");

const skylineMask: CSSProperties = {
  maskImage: skylineMaskImage,
  WebkitMaskImage: skylineMaskImage,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

export function FinalCta() {
  return (
    <Section
      id="demo"
      tone="dark"
      className="relative isolate overflow-clip"
      containerClassName="relative z-10 grid items-start gap-14 lg:grid-cols-2"
      background={
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={skylineMask}
          >
            <div className="parallax-skyline absolute inset-x-0 -top-[15%] bottom-0">
              <Image
                src="/images/final-cta-skyline.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-[25%_100%] opacity-35 lg:opacity-55"
              />
            </div>
          </div>
          <div
            className="parallax-drift absolute inset-x-0 bottom-0 -z-10 hidden md:block"
            style={{ "--drift": "50px" } as CSSProperties}
          >
            <BuildingOutlines className="h-auto w-full" />
          </div>
        </>
      }
    >
      <div>
        <SectionHeading
          dark
          eyebrow={finalCta.eyebrow}
          title={finalCta.title}
          lead={finalCta.text}
          titleClassName="max-w-[24ch]"
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
      </div>
      <DemoForm privacyUrl={contactEnv.privacyUrl} />
    </Section>
  );
}
