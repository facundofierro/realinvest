const buyers = [
  { cx: 44, cy: 76, fill: "#5B1187" },
  { cx: 84, cy: 76, fill: "#8D5A93" },
  { cx: 124, cy: 76, fill: "#D6336C" },
  { cx: 64, cy: 116, fill: "#3B6FD6" },
  { cx: 104, cy: 116, fill: "#2E8B57" },
];

export function BuyersReactivation({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 170"
      role="img"
      aria-label="Compradores de la etapa 1 vuelven a interactuar con el lanzamiento de la etapa 2"
      className={className}
    >
      <rect x="0" y="10" width="170" height="150" rx="16" fill="#F6F4F7" />
      <text x="16" y="34" className="font-mono" fontSize="10" fill="#6B5A74" letterSpacing="0.6">
        ETAPA 1 · COMPRARON
      </text>
      {buyers.map(({ cx, cy, fill }) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="15" fill={fill} />
          <circle cx={cx} cy={cy - 4} r="4" fill="#fff" />
          <path
            d={`M${cx - 8} ${cy + 8}c0-4 3-5 8-5s8 1 8 5z`}
            fill="#fff"
          />
        </g>
      ))}
      <g stroke="#5B1187" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M184 90h130" strokeDasharray="3 7" />
        <path d="M304 80l12 10-12 10" />
      </g>
      <text x="200" y="76" fontSize="12" fontWeight="600" fill="#5B1187">
        Nuevo lanzamiento
      </text>
      <rect x="330" y="10" width="190" height="150" rx="16" fill="#EFE3F6" />
      <text x="346" y="34" className="font-mono" fontSize="10" fill="#5B1187" letterSpacing="0.6">
        ETAPA 2 · ABRE 14 NOV
      </text>
      <rect x="372" y="56" width="70" height="92" rx="4" fill="#fff" stroke="#CFC3D6" />
      <rect x="364" y="50" width="86" height="9" rx="3" fill="#5B1187" />
      <g fill="#BFE8CB">
        <rect x="380" y="68" width="14" height="12" rx="2" />
        <rect x="420" y="68" width="14" height="12" rx="2" />
        <rect x="380" y="90" width="14" height="12" rx="2" />
        <rect x="420" y="110" width="14" height="12" rx="2" />
      </g>
      <g fill="#FFD98F">
        <rect x="400" y="90" width="14" height="12" rx="2" />
        <rect x="380" y="110" width="14" height="12" rx="2" />
      </g>
      <g transform="translate(462 58)">
        <circle cx="18" cy="18" r="18" fill="#D6336C" />
        <path d="M11 24v-5a7 7 0 0114 0v5l2 2H9z" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        <path d="M15 29h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
