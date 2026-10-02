export function ProblemBeforeAfter({
  before,
  after,
  className,
}: {
  before: string;
  after: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 960 300"
      role="img"
      aria-label="Antes: planillas, mensajes y notas dispersas. Después: un solo lugar"
      className={className}
    >
      <rect x="0" y="0" width="450" height="300" rx="16" fill="#F6F4F7" />
      <text
        x="24"
        y="36"
        className="font-mono uppercase"
        fontSize="13"
        fill="#6B5A74"
        letterSpacing="1.5"
      >
        {before}
      </text>
      <g transform="rotate(-6 120 140)">
        <rect x="40" y="70" width="150" height="110" rx="8" fill="#fff" stroke="#CFC3D6" />
        <path d="M40 98h150M40 126h150M40 154h150M90 70v110M140 70v110" stroke="#E0D6E6" />
        <rect x="40" y="70" width="150" height="28" rx="8" fill="#DDF3E4" />
        <text x="52" y="89" fontSize="12" fontWeight="600" fill="#14602B">
          Planilla v7
        </text>
      </g>
      <g transform="rotate(5 300 120)">
        <rect x="220" y="64" width="150" height="62" rx="14" fill="#D6F5C8" />
        <path d="M240 126l-10 14 26-14z" fill="#D6F5C8" />
        <text x="234" y="90" fontSize="12" fill="#2A1634">
          ¿La 8B sigue libre?
        </text>
        <text x="234" y="108" fontSize="12" fill="#2A1634">
          Reservame la 9A
        </text>
      </g>
      <g transform="rotate(-4 330 220)">
        <rect x="250" y="170" width="140" height="62" rx="8" fill="#FFE9A8" />
        <text x="264" y="196" fontSize="12" fill="#5C4500">
          Llamar a Marta
        </text>
        <text x="264" y="214" fontSize="12" fill="#5C4500">
          cuota? comprobante?
        </text>
      </g>
      <g transform="rotate(4 120 240)">
        <rect x="50" y="200" width="130" height="62" rx="14" fill="#fff" stroke="#CFC3D6" />
        <text x="64" y="226" fontSize="12" fill="#2A1634">
          Mail 14/10 — plano
        </text>
        <text x="64" y="244" fontSize="12" fill="#6B5A74">
          sin respuesta…
        </text>
      </g>
      <g fontWeight="700" fontSize="14" fill="#fff">
        <circle cx="200" cy="72" r="13" fill="#D6336C" />
        <text x="195" y="77">?</text>
        <circle cx="392" cy="130" r="13" fill="#D6336C" />
        <text x="387" y="135">?</text>
        <circle cx="194" cy="224" r="13" fill="#D6336C" />
        <text x="189" y="229">?</text>
      </g>
      <g
        transform="translate(450 0)"
        stroke="#5B1187"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 150h50" />
        <path d="M52 140l12 10-12 10" />
      </g>
      <rect x="526" y="0" width="434" height="300" rx="16" fill="#EFE3F6" />
      <text
        x="550"
        y="36"
        className="font-mono uppercase"
        fontSize="13"
        fill="#5B1187"
        letterSpacing="1.5"
      >
        {after}
      </text>
      <rect x="550" y="56" width="386" height="216" rx="14" fill="#fff" stroke="#DCC4EC" />
      <rect x="550" y="56" width="386" height="36" rx="14" fill="#5B1187" />
      <rect x="550" y="78" width="386" height="14" fill="#5B1187" />
      <text x="568" y="80" fontSize="13" fontWeight="600" fill="#fff">
        Torre Mirador
      </text>
      <g fontSize="12" fontWeight="600">
        <text x="568" y="116" fill="#2A1634">8A</text>
        <rect x="620" y="104" width="86" height="18" rx="9" fill="#DDF3E4" />
        <text x="634" y="117" fill="#14602B">Disponible</text>
        <text x="568" y="146" fill="#2A1634">8B</text>
        <rect x="620" y="134" width="86" height="18" rx="9" fill="#FFE9C7" />
        <text x="634" y="147" fill="#7A4A00">Reservada</text>
        <text x="568" y="176" fill="#2A1634">9A</text>
        <rect x="620" y="164" width="86" height="18" rx="9" fill="#E7E2EA" />
        <text x="640" y="177" fill="#4A3B53">Vendida</text>
      </g>
      <rect x="740" y="104" width="180" height="84" rx="10" fill="#F6F4F7" />
      <path
        d="M752 176l30-24 24 14 32-30 40 20"
        stroke="#5B1187"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="568" y="212" fontSize="12" fill="#54445C">
        Reservas, cuotas y documentos al día
      </text>
      <rect x="568" y="228" width="352" height="8" rx="4" fill="#EFE3F6" />
      <rect x="568" y="228" width="240" height="8" rx="4" fill="#5B1187" />
    </svg>
  );
}
