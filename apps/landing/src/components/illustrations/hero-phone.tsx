export function HeroPhone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 150 250"
      role="img"
      aria-label="Portal del comprador en el celular"
      className={className}
    >
      <rect x="2" y="2" width="146" height="246" rx="22" fill="#2A1634" />
      <rect x="9" y="9" width="132" height="232" rx="16" fill="#fff" />
      <rect x="9" y="9" width="132" height="44" rx="16" fill="#5B1187" />
      <rect x="9" y="37" width="132" height="16" fill="#5B1187" />
      <text x="20" y="32" fontSize="10" fontWeight="700" fill="#fff">
        Tu compra
      </text>
      <text x="20" y="46" fontSize="8" fill="#E9CFFA">
        Torre Mirador · 8B
      </text>
      <text x="20" y="72" fontSize="8" fontWeight="600" fill="#2A1634">
        Avance de obra
      </text>
      <rect x="20" y="78" width="110" height="7" rx="3.5" fill="#EFE3F6" />
      <rect x="20" y="78" width="68" height="7" rx="3.5" fill="#5B1187" />
      <rect x="20" y="96" width="110" height="52" rx="8" fill="#D9C3EA" />
      <path d="M20 140l28-22 22 16 18-12 42 18H20z" fill="#B58BD4" />
      <circle cx="46" cy="108" r="5" fill="#fff" />
      <text x="20" y="166" fontSize="8" fontWeight="600" fill="#2A1634">
        Próxima cuota
      </text>
      <rect x="20" y="172" width="110" height="26" rx="8" fill="#F6F4F7" />
      <text x="28" y="188" fontSize="8" fill="#54445C">
        15 nov
      </text>
      <rect x="92" y="178" width="30" height="14" rx="7" fill="#FFE9C7" />
      <rect x="20" y="206" width="110" height="22" rx="8" fill="#F6F4F7" />
      <rect x="28" y="212" width="10" height="10" rx="2" fill="#B58BD4" />
      <text x="44" y="221" fontSize="8" fill="#54445C">
        Contrato.pdf
      </text>
    </svg>
  );
}
