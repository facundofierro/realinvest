import Image from "next/image";
import { CardVideo } from "@/components/card-video";
import { CtaLink } from "@/components/cta-link";
import { DecorBlobs } from "@/components/decor-blobs";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { services } from "@/content/es";
import { cn } from "@/lib/utils";

const images: Record<
  (typeof services.cards)[number]["key"],
  { src: string; alt: string; video?: string | string[] }
> = {
  setup: {
    src: "/images/service-setup.webp",
    alt: "Equipo trabajando junto a una maqueta de edificio",
  },
  "3d": {
    src: "/images/service-3d.webp",
    video: [
      "service-3d",
      "service-3d-living",
      "service-3d-bedroom",
      "service-3d-lobby",
    ],
    alt: "Render de una torre residencial con jardín",
  },
  crm: {
    src: "/images/service-crm-team.webp",
    alt: "Equipo de marketing revisando métricas de campañas en una pantalla grande",
  },
};

export function Services() {
  return (
    <Section
      id="servicios"
      className="relative isolate overflow-clip"
      background={
        <DecorBlobs
          blobs={[
            { className: "-right-40 top-[-6%] size-[460px]" },
            { className: "-left-44 bottom-[4%] size-[380px]", drift: -80 },
          ]}
        />
      }
    >
      <SectionHeading
        eyebrow={services.eyebrow}
        title={services.title}
        lead={services.text}
        className="mb-10"
      />
      <div className="group/grid services-row grid gap-5 md:flex">
        {services.cards.map((card) => {
          const image = images[card.key];
          return (
            <div
              key={card.key}
              className={cn(
                cardClass,
                "service-card",
                // Hovered card grows, siblings shrink; flex-grow eases smoothly.
                "min-w-0 md:basis-0 md:grow md:transition-[flex-grow] md:duration-[1200ms] md:ease-in-out motion-reduce:transition-none",
                "md:group-has-[:hover]/grid:grow-[0.55] md:hover:grow-[1.9]!",
              )}
            >
              {image.video ? (
                <CardVideo
                  name={image.video}
                  poster={image.src}
                  label={image.alt}
                  width={960}
                  height={640}
                  fade={0.35}
                  gap={80}
                  className="mb-4 block h-auto w-full rounded-2xl"
                />
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={960}
                  height={640}
                  sizes="(min-width: 1180px) 320px, (min-width: 768px) 33vw, 100vw"
                  className="mb-4 block h-auto w-full rounded-2xl"
                />
              )}
              {/* Text re-wraps as the card resizes; the text fades to near-transparent
                  while the card animates (see .card-text in globals.css). */}
              <div className="card-text">
                <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
                  {card.title}
                </h3>
                <p className="text-[15.5px] text-muted-foreground">
                  {card.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
        <p className="max-w-[60ch] text-sm text-[#6B5A74]">
          {services.scopeNote}
        </p>
        <CtaLink href={services.cta.href} variant="ghost">
          {services.cta.label}
        </CtaLink>
      </div>
    </Section>
  );
}
