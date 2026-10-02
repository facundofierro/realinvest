import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const paths = {
  grid: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6" />
      <path
        d="M17 5a3 3 0 010 6M19 14c1.5.8 2.5 2.5 2.5 6"
        strokeDasharray="2 3"
      />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M3 17l5-4 4 3 3-3 6 5" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  spark: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
  bell: (
    <>
      <path d="M6 16v-5a6 6 0 0112 0v5l2 2H4z" />
      <path d="M10 21h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3 20c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6" />
    </>
  ),
  chart: <path d="M4 20V11M10 20V4M16 20v-7M2 20h20" />,
  flag: <path d="M5 21V4M5 4h12l-2 4 2 4H5" />,
  stairs: <path d="M3 20h5v-5h5v-5h5V5h3" />,
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v3M17 20h4" />
    </>
  ),
  bank: <path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0116 0v2" />
      <rect x="2" y="14" width="5" height="7" rx="2" />
      <rect x="17" y="14" width="5" height="7" rx="2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

/** Decorative 24px stroke icon (1.8px, inherits `currentColor`). */
export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-[26px]", className)}
    >
      {paths[name]}
    </svg>
  );
}

/** Icon inside a rounded tinted tile (52px by default, 44px when `small`). */
export function IconTile({
  name,
  dark = false,
  small = false,
  className,
}: {
  name: IconName;
  dark?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-none items-center justify-center rounded-2xl",
        small ? "size-11" : "size-[52px]",
        dark ? "bg-white/[0.12] text-[#E9CFFA]" : "bg-tint text-brand",
        className,
      )}
    >
      <Icon name={name} />
    </div>
  );
}
