import { CtaLink } from "@/components/cta-link";
import { HeroPhone } from "@/components/illustrations/hero-phone";
import { Eyebrow } from "@/components/section";
import { StatusBadge, type UnitStatus } from "@/components/status-badge";
import { hero, sampleDataLabel } from "@/content/es";

const stats = [
  { value: "48", label: "Unidades" },
  { value: "212", label: "Registrados" },
  { value: "17", label: "Reservas" },
  { value: "3", label: "Vendidas" },
];

const units: { id: string; detail: string; status: UnitStatus; label: string }[] = [
  { id: "8A", detail: "2 dorm · 74 m²", status: "available", label: "Disponible" },
  { id: "8B", detail: "3 dorm · 98 m²", status: "reserved", label: "Reservada" },
  { id: "9A", detail: "1 dorm · 46 m²", status: "sold", label: "Vendida" },
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
      {/* Right padding keeps the badges clear of the overlapping phone mock. */}
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
    <section className="bg-[radial-gradient(900px_400px_at_85%_0%,#EAD7F5_0%,rgba(246,244,247,0)_70%)] pb-[72px] pt-14 md:pt-[88px]">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mb-[22px] text-balance text-[clamp(38px,5.6vw,66px)] font-bold leading-[1.04] tracking-[-0.03em]">
            {hero.title}
          </h1>
          <p className="mb-8 max-w-[60ch] text-lg text-muted-foreground">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <CtaLink href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaLink>
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
          <HeroPhone className="absolute -bottom-6 right-0 hidden w-[150px] drop-shadow-[0_20px_24px_rgba(59,33,70,0.35)] sm:block sm:-right-2" />
        </div>
      </div>
    </section>
  );
}
