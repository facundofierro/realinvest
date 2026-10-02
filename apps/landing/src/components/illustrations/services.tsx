type Props = { className?: string };

const cubeTransform = "translate(0 -6) scale(1 .8) translate(0 24)";

export function ServiceSetup({ className }: Props) {
  return (
    <svg viewBox="0 0 320 120" aria-hidden="true" className={className}>
      <rect width="320" height="120" rx="14" fill="#EFE3F6" />
      <rect x="24" y="22" width="160" height="76" rx="8" fill="#fff" />
      <rect x="24" y="22" width="160" height="16" rx="8" fill="#5B1187" />
      <rect x="24" y="30" width="160" height="8" fill="#5B1187" />
      <circle cx="36" cy="30" r="2" fill="#fff" />
      <rect x="36" y="50" width="60" height="8" rx="4" fill="#D9C3EA" />
      <rect x="36" y="66" width="100" height="8" rx="4" fill="#EFE3F6" />
      <rect x="36" y="80" width="40" height="10" rx="5" fill="#5B1187" />
      <g transform="translate(206 30)">
        <circle cx="40" cy="30" r="28" fill="#fff" />
        <path d="M40 16v28M26 30h28" stroke="#D6336C" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Service3d({ className }: Props) {
  return (
    <svg viewBox="0 0 320 120" aria-hidden="true" className={className}>
      <rect width="320" height="120" rx="14" fill="#E3E8FF" />
      <g stroke="#3B4FB8" strokeWidth="2" strokeLinejoin="round" transform={cubeTransform}>
        <path d="M160 18l62 30v44l-62 30-62-30V48z" fill="#fff" />
        <path d="M98 48l62 30 62-30M160 78v44" fill="none" />
        <path d="M160 18l62 30-62 30-62-30z" fill="#B9C6FF" />
      </g>
      <g transform="translate(246 70)">
        <circle cx="20" cy="20" r="18" fill="#fff" />
        <path d="M14 14l12 6-12 6z" fill="#3B4FB8" />
      </g>
    </svg>
  );
}

export function ServiceCrm({ className }: Props) {
  return (
    <svg viewBox="0 0 320 120" aria-hidden="true" className={className}>
      <rect width="320" height="120" rx="14" fill="#FFE9C7" />
      <rect x="28" y="24" width="120" height="44" rx="14" fill="#fff" />
      <path d="M48 68l-8 14 22-14z" fill="#fff" />
      <rect x="42" y="38" width="70" height="7" rx="3.5" fill="#E8C98A" />
      <rect x="42" y="52" width="48" height="7" rx="3.5" fill="#F2DDB0" />
      <rect x="172" y="50" width="120" height="44" rx="14" fill="#5B1187" />
      <rect x="188" y="64" width="70" height="7" rx="3.5" fill="#fff" />
      <rect x="188" y="78" width="44" height="7" rx="3.5" fill="#D9B8EE" />
      <g transform="translate(262 22)">
        <path d="M14 0l4 10 10 4-10 4-4 10-4-10L0 14l10-4z" fill="#D6336C" />
      </g>
    </svg>
  );
}
