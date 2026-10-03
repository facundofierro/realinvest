import { CardVideo } from "@/components/card-video";
import { CheckList, Section, SectionHeading, cardClass } from "@/components/section";
import { StatusBadge, type UnitStatus } from "@/components/status-badge";
import { knowYourBuyers, sampleDataLabel } from "@/content/es";
import { cn } from "@/lib/utils";

// Avatar colour and badge tone for each sample activity row.
const rowStyles: { avatar: string; badge: UnitStatus }[] = [
  { avatar: "#2E8B57", badge: "available" },
  { avatar: "#B7791F", badge: "reserved" },
  { avatar: "#3B6FD6", badge: "upcoming" },
];

export function KnowYourBuyers() {
  return (
    <Section containerClassName="grid items-center gap-14 lg:grid-cols-2">
      <div>
        <SectionHeading
          eyebrow={knowYourBuyers.eyebrow}
          title={knowYourBuyers.title}
          lead={knowYourBuyers.lead}
        />
        <CheckList
          className="mt-5"
          items={knowYourBuyers.points.map((point) => (
            <>
              <b className="font-semibold">{point.title}.</b> {point.text}
            </>
          ))}
        />
        <p className="mt-[22px] text-[13px] text-[#6B5A74]">
          {knowYourBuyers.note}
        </p>
      </div>
      <div
        className={cn(
          cardClass,
          "p-6 shadow-[0_30px_60px_-30px_rgba(59,33,70,0.3)]",
        )}
      >
        <CardVideo
          name="buyers-reactivation"
          poster="/images/buyers-reactivation.webp"
          label="Compradores de la etapa 1 vuelven a interactuar con el lanzamiento de la etapa 2"
          width={960}
          height={720}
          fade={1}
          className="block h-auto w-full rounded-2xl"
        />
        <ul className="mt-2" aria-label="Ejemplo ilustrativo de actividad de interesados">
          {knowYourBuyers.activity.map((row, i) => (
            <li
              key={row.name}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE7F2] py-3.5"
            >
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex size-[38px] flex-none items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: rowStyles[i].avatar }}
                >
                  {row.name.split(" ").at(-1)?.charAt(0)}
                </div>
                <div>
                  <b className="font-semibold">{row.name}</b>
                  <small className="block text-[13px] text-[#6B5A74]">
                    {row.detail}
                  </small>
                </div>
              </div>
              <StatusBadge status={rowStyles[i].badge}>{row.badge}</StatusBadge>
            </li>
          ))}
        </ul>
        <div className="mt-1.5 text-xs text-[#6B5A74]">{sampleDataLabel}</div>
      </div>
    </Section>
  );
}
