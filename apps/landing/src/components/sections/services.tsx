import Image from "next/image";
import { CtaLink } from "@/components/cta-link";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { services } from "@/content/es";

const images: Record<
  (typeof services.cards)[number]["key"],
  { src: string; alt: string }
> = {
  setup: {
    src: "/images/service-setup.webp",
    alt: "Equipo trabajando junto a una maqueta de edificio",
  },
  "3d": {
    src: "/images/service-3d.webp",
    alt: "Render de una torre residencial con jardín",
  },
  crm: {
    src: "/images/service-crm.webp",
    alt: "Ilustración de interesados avanzando por un embudo de ventas",
  },
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
          const image = images[card.key];
          return (
            <div key={card.key} className={cardClass}>
              <Image
                src={image.src}
                alt={image.alt}
                width={960}
                height={640}
                sizes="(min-width: 1180px) 320px, (min-width: 768px) 33vw, 100vw"
                className="mb-4 block h-auto w-full rounded-2xl"
              />
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
