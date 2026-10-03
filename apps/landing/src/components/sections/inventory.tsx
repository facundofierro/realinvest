import { InventoryVideo } from "@/components/inventory-video";
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
      <div>
        <InventoryVideo label="Ilustración de un edificio con cada unidad coloreada según su estado" />
        <div className="badge-carousel relative mx-auto -mt-10 grid w-fit grid-cols-2 justify-items-center gap-x-2 gap-y-5">
          {inventory.statuses.map((status) => (
            <StatusBadge
              key={status.key}
              status={status.key}
              className={
                status.key === "available"
                  ? "relative -left-14"
                  : status.key === "reserved"
                    ? "relative left-14"
                    : undefined
              }
            >
              {status.label}
            </StatusBadge>
          ))}
        </div>
      </div>
    </Section>
  );
}
