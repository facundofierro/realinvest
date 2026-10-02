export function TrustLoop({
  labels,
  className,
}: {
  labels: readonly [string, string, string];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 960 120"
      role="img"
      aria-label={labels.join(" → ")}
      className={className}
    >
      <g textAnchor="middle" fontSize="15" fontWeight="600" fill="#2A1634">
        <text x="140" y="112">{labels[0]}</text>
        <text x="480" y="112">{labels[1]}</text>
        <text x="820" y="112">{labels[2]}</text>
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="140" cy="52" r="38" fill="#EFE3F6" />
        <path d="M122 52h36M146 40l12 12-12 12" stroke="#5B1187" strokeWidth="3" />
        <g stroke="#B58BD4" strokeWidth="2.5">
          <path d="M200 52h160" strokeDasharray="3 7" />
          <path d="M352 44l10 8-10 8" />
          <path d="M600 52h160" strokeDasharray="3 7" />
          <path d="M752 44l10 8-10 8" />
        </g>
        <circle cx="480" cy="52" r="38" fill="#5B1187" />
        <g stroke="#fff" strokeWidth="3">
          <path d="M480 34l16 6v10c0 10-7 17-16 20-9-3-16-10-16-20V40z" />
          <path d="M473 52l5 5 9-10" />
        </g>
        <circle cx="820" cy="52" r="38" fill="#EFE3F6" />
        <g stroke="#5B1187" strokeWidth="3">
          <path d="M804 56c0-8 6-14 16-14 5 0 9 2 12 5M836 48c0 8-6 14-16 14-5 0-9-2-12-5" />
          <path d="M830 42l4 6-7 2M810 62l-4-6 7-2" />
        </g>
      </g>
    </svg>
  );
}
