import { cn } from "@/lib/utils";

// x, width, height and floor count of each tower (viewBox 1200 × 300).
const towers = [
  [0, 90, 150, 6],
  [100, 70, 220, 9],
  [180, 110, 120, 5],
  [300, 80, 260, 11],
  [390, 60, 180, 7],
  [460, 120, 100, 4],
  [590, 75, 240, 10],
  [675, 95, 160, 6],
  [780, 65, 280, 12],
  [855, 110, 130, 5],
  [975, 80, 210, 9],
  [1065, 135, 150, 6],
] as const;

/** Thin line-art skyline for the dark bands; purely decorative. */
export function BuildingOutlines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 300"
      fill="none"
      stroke="#D9B8EE"
      strokeOpacity="0.1"
      strokeWidth="1.5"
      className={cn("pointer-events-none", className)}
    >
      {towers.map(([x, w, h, floors]) => (
        <g key={x}>
          <rect
            x={x}
            y={300 - h}
            width={w}
            height={h}
            vectorEffect="non-scaling-stroke"
          />
          {Array.from({ length: floors - 1 }, (_, i) => {
            const y = 300 - h + ((i + 1) * h) / floors;
            return (
              <line
                key={i}
                x1={x + 10}
                x2={x + w - 10}
                y1={y}
                y2={y}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <line
            x1={x + w / 2}
            x2={x + w / 2}
            y1={300 - h}
            y2={300 - h - 18}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  );
}
