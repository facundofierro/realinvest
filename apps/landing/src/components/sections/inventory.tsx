import { BuildingStatus } from "@/components/illustrations/building-status";
import { CheckList, Section, SectionHeading } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { inventory } from "@/content/es";

export function Inventory() {
  return (
    <Section
      id="producto"
      tone="white"
      containerClassName="grid items-center gap-14 lg:grid-cols-2"
    >
      <div>
        <SectionHeading
          eyebrow={inventory.eyebrow}
          title={inventory.title}
          lead={inventory.text}
        />
        <CheckList items={inventory.points} className="mt-5" />
      </div>
      <div className="rounded-3xl border border-card-border bg-background p-6">
        <BuildingStatus className="mx-auto block h-auto max-h-[440px] w-full" />
        <div className="mt-3.5 flex flex-wrap gap-2">
          {inventory.statuses.map((status) => (
            <StatusBadge key={status.key} status={status.key}>
              {status.label}
            </StatusBadge>
          ))}
        </div>
      </div>
    </Section>
  );
}
