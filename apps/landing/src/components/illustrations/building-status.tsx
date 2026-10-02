const fills = { A: "#BFE8CB", R: "#FFD98F", S: "#CFC6D6", U: "#B9C6FF" } as const;

// One string per floor (top to bottom): Available, Reserved, Sold, Upcoming, "-" = no window.
const floors = ["ARSUA", "AUARS", "RUASA", "ASURA", "SUAAR", "AU--S"];
const columns = [76, 118, 160, 202, 244];

export function BuildingStatus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 440"
      role="img"
      aria-label="Ilustración de un edificio con cada unidad coloreada según su estado"
      className={className}
    >
      <rect x="0" y="392" width="400" height="8" rx="4" fill="#DCC4EC" />
      <rect x="60" y="48" width="236" height="344" rx="10" fill="#fff" stroke="#CFC3D6" strokeWidth="2" />
      <rect x="50" y="36" width="256" height="16" rx="6" fill="#5B1187" />
      <rect x="198" y="340" width="44" height="52" rx="6" fill="#5B1187" />
      <circle cx="232" cy="368" r="2.5" fill="#fff" />
      {floors.map((floor, row) =>
        [...floor].map((status, col) =>
          status === "-" ? null : (
            <rect
              key={`${row}-${col}`}
              x={columns[col]}
              y={68 + row * 50}
              width="36"
              height="34"
              rx="5"
              fill={fills[status as keyof typeof fills]}
            />
          ),
        ),
      )}
      <path d="M262 185h22" stroke="#DCC4EC" strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(284 152)">
        <rect x="0" y="0" width="108" height="64" rx="12" fill="#fff" stroke="#DCC4EC" />
        <text x="12" y="22" fontSize="12" fontWeight="700" fill="#2A1634">
          Unidad 8B
        </text>
        <text x="12" y="40" fontSize="11" fill="#54445C">
          3 dorm · 98 m²
        </text>
        <rect x="12" y="46" width="62" height="12" rx="6" fill="#FFE9C7" />
        <text x="20" y="55" fontSize="9" fontWeight="700" fill="#7A4A00">
          Reservada
        </text>
      </g>
    </svg>
  );
}
