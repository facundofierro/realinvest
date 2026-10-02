export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 -12 480 182" aria-hidden="true" className={className}>
      <rect x="0" y="160" width="480" height="4" rx="2" fill="#5B3A70" />
      <g fill="#3A2056" stroke="#6B4A86" strokeWidth="1.5">
        <rect x="20" y="70" width="60" height="90" rx="4" />
        <rect x="92" y="30" width="70" height="130" rx="4" />
        <rect x="176" y="90" width="56" height="70" rx="4" />
        <rect x="300" y="60" width="64" height="100" rx="4" />
        <rect x="378" y="100" width="70" height="60" rx="4" />
      </g>
      <rect x="244" y="10" width="44" height="150" rx="4" fill="#5B1187" stroke="#D9B8EE" strokeWidth="1.5" />
      <g fill="#D9B8EE" opacity=".85">
        {[24, 44, 64, 84].map((y) => (
          <g key={y}>
            <rect x="252" y={y} width="10" height="10" rx="2" />
            <rect x="270" y={y} width="10" height="10" rx="2" />
          </g>
        ))}
      </g>
      <g fill="#7A5A90">
        <rect x="32" y="84" width="10" height="10" rx="2" />
        <rect x="56" y="84" width="10" height="10" rx="2" />
        <rect x="104" y="46" width="10" height="10" rx="2" />
        <rect x="132" y="46" width="10" height="10" rx="2" />
        <rect x="104" y="76" width="10" height="10" rx="2" />
        <rect x="312" y="76" width="10" height="10" rx="2" />
        <rect x="338" y="76" width="10" height="10" rx="2" />
      </g>
      <path d="M266 10V-2" stroke="#D6336C" strokeWidth="2" />
      <path d="M266 -2h14l-3 5 3 5h-14" fill="#D6336C" />
    </svg>
  );
}
