import { StatusBadge } from "@/components/status-badge";
import { investorExperience, sampleDataLabel } from "@/content/es";

const monoLabel =
  "mb-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-brand";

function ProgressRow({
  label,
  value,
  percent,
  barClass,
}: {
  label: string;
  value: string;
  percent: number;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-[5px] flex justify-between">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="h-2 rounded bg-[#E0D6E6]">
        <div className={`h-2 rounded ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** HTML + SVG card mocking the investor app (illustrative data). */
export function InvestorAppMock() {
  const { mock } = investorExperience;
  return (
    <div
      role="img"
      aria-label="Ejemplo ilustrativo de la app del inversor: oportunidades y seguimiento de su compra"
      className="grid gap-[18px] rounded-[20px] border border-[#E0D6E6] bg-white p-5 shadow-[0_30px_60px_-30px_rgba(59,33,70,0.35)]"
    >
      <div className="flex items-center justify-between gap-3">
        <b>Hola, Interesado B.</b>
        <StatusBadge status="upcoming">{sampleDataLabel}</StatusBadge>
      </div>
      <div>
        <div className={monoLabel}>{mock.opportunitiesTitle}</div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          <div className="overflow-hidden rounded-[14px] border border-card-border">
            <svg viewBox="0 0 200 90" className="block w-full" aria-hidden="true">
              <rect width="200" height="90" fill="#D9C3EA" />
              <rect x="40" y="22" width="40" height="68" fill="#fff" />
              <rect x="84" y="8" width="44" height="82" fill="#B58BD4" />
              <rect x="132" y="34" width="36" height="56" fill="#fff" />
              <g fill="#EFE3F6">
                <rect x="92" y="18" width="8" height="8" />
                <rect x="108" y="18" width="8" height="8" />
                <rect x="92" y="34" width="8" height="8" />
                <rect x="108" y="34" width="8" height="8" />
              </g>
            </svg>
            <div className="px-3 py-2.5">
              <b className="text-sm">Torre Mirador</b>
              <div className="text-xs text-[#6B5A74]">Etapa 2 · 2–3 dorm</div>
              <StatusBadge status="upcoming" className="mt-1.5">
                Abre 14 nov
              </StatusBadge>
            </div>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-card-border">
            <svg viewBox="0 0 200 90" className="block w-full" aria-hidden="true">
              <rect width="200" height="90" fill="#C9D4FF" />
              <rect x="30" y="30" width="50" height="60" fill="#fff" />
              <rect x="84" y="16" width="38" height="74" fill="#8FA6F0" />
              <rect x="126" y="40" width="46" height="50" fill="#fff" />
              <g fill="#E3E8FF">
                <rect x="92" y="26" width="8" height="8" />
                <rect x="106" y="26" width="8" height="8" />
                <rect x="92" y="42" width="8" height="8" />
              </g>
            </svg>
            <div className="px-3 py-2.5">
              <b className="text-sm">Parque Norte</b>
              <div className="text-xs text-[#6B5A74]">Etapa 1 · 1–2 dorm</div>
              <StatusBadge status="available" className="mt-1.5">
                Disponible
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-[14px] bg-background p-4">
        <div className={monoLabel}>{mock.purchaseTitle}</div>
        <div className="grid gap-3 text-[13px]">
          <ProgressRow
            label={mock.progressLabel}
            value={`${mock.progressValue}%`}
            percent={mock.progressValue}
            barClass="bg-brand"
          />
          <ProgressRow
            label={mock.installmentsLabel}
            value={mock.installmentsValue}
            percent={25}
            barClass="bg-[#2E8B57]"
          />
          <div className="flex items-center justify-between">
            <span>
              {mock.nextInstallmentLabel} · {mock.nextInstallmentValue}
            </span>
            <StatusBadge status="reserved">Pagar</StatusBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
