import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type UnitStatus = "available" | "reserved" | "sold" | "upcoming";

const statusClasses: Record<UnitStatus, string> = {
  available: "bg-[#DDF3E4] text-[#14602B]",
  reserved: "bg-[#FFE9C7] text-[#7A4A00]",
  sold: "bg-[#E7E2EA] text-[#4A3B53]",
  upcoming: "bg-[#E3E8FF] text-[#2B3A9C]",
};

export function StatusBadge({
  status,
  className,
  children,
}: {
  status: UnitStatus;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold",
        statusClasses[status],
        className,
      )}
    >
      {children}
    </span>
  );
}
