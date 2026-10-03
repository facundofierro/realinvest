import type { CSSProperties } from "react";
import { InventoryVideo } from "@/components/inventory-video";
import { CheckList, Section, SectionHeading } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { inventory } from "@/content/es";
import { cn } from "@/lib/utils";

// Scroll travel of each status badge, so they float at different depths.
const badgeDrifts = ["-40px", "-20px", "-55px", "-30px"];

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
        <div
          className="parallax-drift"
          style={{ "--drift": "30px" } as CSSProperties}
        >
          <InventoryVideo label="Ilustración de un edificio con cada unidad coloreada según su estado" />
        </div>
        <div className="badge-carousel relative mx-auto -mt-10 grid w-fit grid-cols-2 justify-items-center gap-x-2 gap-y-5">
          {inventory.statuses.map((status, i) => (
            <span
              key={status.key}
              className={cn(
                "parallax-drift",
                status.key === "available" && "relative -left-14",
                status.key === "reserved" && "relative left-14",
              )}
              style={{ "--drift": badgeDrifts[i] } as CSSProperties}
            >
              <StatusBadge status={status.key}>{status.label}</StatusBadge>
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
