import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { CtaLink } from "@/components/cta-link";
import { DecorBlobs } from "@/components/decor-blobs";
import { PhoneScreenshot } from "@/components/phone-screenshot";
import { Eyebrow } from "@/components/section";
import { StatusBadge, type UnitStatus } from "@/components/status-badge";
import { hero, sampleDataLabel } from "@/content/es";
import { cn } from "@/lib/utils";

const stats = [
  { value: "48", label: "Unidades" },
  { value: "212", label: "Registrados" },
  { value: "17", label: "Reservas" },
  { value: "3", label: "Vendidas" },
];

const units: {
  id: string;
  detail: string;
  status: UnitStatus;
  label: string;
}[] = [
  {
    id: "8A",
    detail: "2 dorm · 74 m²",
    status: "available",
    label: "Disponible",
  },
  {
    id: "8B",
    detail: "3 dorm · 98 m²",
    status: "reserved",
    label: "Reservada",
  },
  { id: "9A", detail: "1 dorm · 46 m²", status: "sold", label: "Vendida" },
];

// Position and scroll travel of each floating chip (hero.chips order).
const chipStyles = [
  { position: "-left-4 -top-6", rise: "-6vh" },
  { position: "-left-5 bottom-0", rise: "-14vh" },
  { position: "-top-7 right-12", rise: "-9vh" },
];

function DashboardCard() {
  return (
    <div
      role="img"
      aria-label="Ejemplo ilustrativo del panel de inventario"
      className="rounded-3xl border border-[#E0D6E6] bg-white p-[22px] shadow-[0_30px_60px_-30px_rgba(59,33,70,0.35)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Torre Mirador · Etapa 2</div>
          <div className="text-[13px] text-[#6B5A74]">{sampleDataLabel}</div>
        </div>
        <StatusBadge status="upcoming">Abre 14 nov</StatusBadge>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-background p-3">
            <div className="text-2xl font-bold leading-tight">{stat.value}</div>
            <div className="text-xs text-[#6B5A74]">{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Right padding keeps the badges clear of the overlapping phone screenshot. */}
      <div className="text-sm sm:pr-[124px]">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="flex items-center justify-between gap-3 border-t border-[#EEE7F2] py-3"
          >
            <span>
              <b>{unit.id}</b> · {unit.detail}
            </span>
            <StatusBadge status={unit.status}>{unit.label}</StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="parallax-hero relative isolate flex min-h-[calc(100svh-68px)] flex-col justify-center overflow-x-clip bg-[radial-gradient(900px_400px_at_85%_0%,#F3E8FA_0%,rgba(246,244,247,0)_70%)] pb-[72px] pt-14 md:pt-[88px]">
      <DecorBlobs
        className="parallax-hero-bg [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
        blobs={[{ className: "right-[6%] top-[14%] size-[420px]", drift: -40 }]}
      >
        <div className="hero-dot-grid absolute inset-0" />
      </DecorBlobs>
      <div className="parallax-hero-out mx-auto grid w-full max-w-[1180px] items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mb-[22px] text-balance text-[clamp(38px,5.6vw,66px)] font-bold leading-[1.04] tracking-[-0.03em]">
            {hero.title}
          </h1>
          <p className="mb-8 max-w-[60ch] text-lg text-muted-foreground">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <CtaLink href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </CtaLink>
            <CtaLink href={hero.secondaryCta.href} variant="ghost">
              {hero.secondaryCta.label}
            </CtaLink>
          </div>
          <p className="mt-[26px] text-sm text-muted-foreground">
            {hero.support.join(" · ")}
          </p>
        </div>
        <div className="animate-fade-in-up relative pb-10 sm:pr-2">
          <DashboardCard />
          <div className="parallax-hero-phone absolute -bottom-6 right-0 hidden sm:-right-2 sm:block">
            <PhoneScreenshot
              src="/images/screenshot-hero.webp"
              alt="Pantalla de inicio de la app en el celular"
              height={1688}
              sizes="150px"
              priority
              className="w-[150px]"
              frameClassName="shadow-[0_20px_24px_rgba(59,33,70,0.35)] group-hover/phone:shadow-[0_26px_30px_rgba(59,33,70,0.4)]"
            />
          </div>
          {hero.chips.map((chip, i) => (
            <div
              key={chip.badge}
              aria-hidden="true"
              className={cn(
                "parallax-hero-chip absolute hidden md:block",
                chipStyles[i].position,
              )}
              style={{ "--chip-rise": chipStyles[i].rise } as CSSProperties}
            >
              <div className="flex items-center gap-2 rounded-2xl border border-[#EEE7F2] bg-white px-3 py-2 text-[13px] font-medium shadow-[0_14px_28px_-14px_rgba(59,33,70,0.45)]">
                <StatusBadge status={chip.status}>{chip.badge}</StatusBadge>
                {chip.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="parallax-hero-cue absolute inset-x-0 bottom-6 hidden justify-center md:flex"
      >
        <ChevronDown className="size-6 text-brand/60 motion-safe:animate-bounce" />
      </div>
    </section>
  );
}
