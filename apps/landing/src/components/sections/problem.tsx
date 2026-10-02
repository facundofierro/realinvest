import Image from "next/image";
import { IconTile, type IconName } from "@/components/illustrations/icons";
import { Section, SectionHeading, cardClass } from "@/components/section";
import { problem } from "@/content/es";
import { cn } from "@/lib/utils";

const icons: IconName[] = ["grid", "users", "doc", "clock"];

const beforeAfter = [
  {
    src: "/images/problem-before.webp",
    alt: "Escritorio con planillas, notas y mensajes dispersos",
    caption: problem.illustration.before,
  },
  {
    src: "/images/problem-after.webp",
    alt: "Inventario ordenado en un solo tablero",
    caption: problem.illustration.after,
  },
];

export function Problem() {
  return (
    <Section className="pt-10 md:pt-14">
      <SectionHeading
        eyebrow={problem.eyebrow}
        title={problem.title}
        lead={problem.text}
        className="mb-10"
      />
      <div className="mb-5 grid gap-5 md:grid-cols-2">
        {beforeAfter.map((item) => (
          <figure key={item.src} className={cn(cardClass, "p-4")}>
            <Image
              src={item.src}
              alt={item.alt}
              width={960}
              height={720}
              sizes="(min-width: 1180px) 550px, (min-width: 768px) 50vw, 100vw"
              className="block h-auto w-full rounded-xl"
            />
            <figcaption className="mt-3 px-1 text-[15px] font-semibold">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {problem.items.map((item, i) => (
          <div key={item.title} className={cardClass}>
            <IconTile name={icons[i]} className="mb-4" />
            <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="text-[15.5px] text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
