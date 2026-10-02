export function PortalPhone({
  showAssistant = true,
  className,
}: {
  showAssistant?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 280 520"
      role="img"
      aria-label="Portal del comprador en un celular: avance de obra, cuotas y documentos"
      className={className}
    >
      <rect x="2" y="2" width="276" height="516" rx="38" fill="#2A1634" />
      <rect x="12" y="12" width="256" height="496" rx="30" fill="#F6F4F7" />
      <rect x="12" y="12" width="256" height="92" rx="30" fill="#5B1187" />
      <rect x="12" y="70" width="256" height="34" fill="#5B1187" />
      <text x="30" y="52" fontSize="16" fontWeight="700" fill="#fff">
        Hola, Interesado B.
      </text>
      <text x="30" y="74" fontSize="12" fill="#E9CFFA">
        Torre Mirador · Unidad 8B
      </text>

      <rect x="26" y="116" width="228" height="128" rx="16" fill="#fff" />
      <text x="40" y="140" fontSize="12" fontWeight="700" fill="#2A1634">
        Avance de obra
      </text>
      <text x="214" y="140" fontSize="12" fontWeight="700" fill="#5B1187">
        62%
      </text>
      <rect x="40" y="150" width="200" height="8" rx="4" fill="#EFE3F6" />
      <rect x="40" y="150" width="124" height="8" rx="4" fill="#5B1187" />
      <rect x="40" y="170" width="200" height="60" rx="10" fill="#D9C3EA" />
      <path d="M40 224l50-36 36 24 30-20 44 26v6H40z" fill="#B58BD4" />
      <circle cx="76" cy="188" r="7" fill="#fff" />

      <rect x="26" y="256" width="228" height="62" rx="16" fill="#fff" />
      <text x="40" y="280" fontSize="12" fontWeight="700" fill="#2A1634">
        Próxima cuota
      </text>
      <text x="40" y="300" fontSize="12" fill="#54445C">
        15 de noviembre
      </text>
      <rect x="176" y="272" width="64" height="26" rx="13" fill="#FFE9C7" />
      <text x="188" y="289" fontSize="11" fontWeight="700" fill="#7A4A00">
        Pendiente
      </text>

      <rect x="26" y="330" width="228" height="100" rx="16" fill="#fff" />
      <text x="40" y="354" fontSize="12" fontWeight="700" fill="#2A1634">
        Documentos
      </text>
      <rect x="40" y="364" width="14" height="16" rx="3" fill="#B58BD4" />
      <text x="62" y="377" fontSize="12" fill="#54445C">
        Contrato de reserva
      </text>
      <rect x="40" y="390" width="14" height="16" rx="3" fill="#B58BD4" />
      <text x="62" y="403" fontSize="12" fill="#54445C">
        Comprobante cuota 3
      </text>

      {showAssistant && (
        <>
          <rect x="26" y="442" width="228" height="48" rx="16" fill="#fff" />
          <circle cx="52" cy="466" r="12" fill="#EFE3F6" />
          <path d="M52 458l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#5B1187" />
          <text x="72" y="470" fontSize="12" fill="#54445C">
            ¿Tenés dudas? Preguntá acá
          </text>
        </>
      )}
    </svg>
  );
}
