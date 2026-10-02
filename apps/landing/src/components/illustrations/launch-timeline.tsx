const labels = ["Etapas", "Registro", "Demanda", "Apertura", "Siguiente"];

/** 5-step launch timeline; `highlighted` is the 0-based step drawn in pink. */
export function LaunchTimeline({
  highlighted,
  className,
}: {
  highlighted: number;
  className?: string;
}) {
  const x = (i: number) => 100 + i * 200;
  return (
    <svg
      viewBox="0 0 1000 120"
      role="img"
      aria-label="Línea de tiempo del lanzamiento: etapas, registro, demanda, apertura y siguiente etapa"
      className={className}
    >
      <path d="M80 60H920" stroke="#5B3A70" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
      <path
        d={`M80 60H${x(highlighted) - 140}`}
        stroke="#D9B8EE"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {labels.map((label, i) => {
        const isHighlighted = i === highlighted;
        const isUpcoming = i > highlighted;
        return (
          <g key={label} textAnchor="middle">
            <circle
              cx={x(i)}
              cy="60"
              r={isHighlighted ? 30 : 24}
              fill={isHighlighted ? "#D6336C" : isUpcoming ? "#3A2548" : "#5B1187"}
              stroke={isUpcoming ? "#7A5A90" : undefined}
              strokeWidth={isUpcoming ? 2 : undefined}
            />
            <text
              x={x(i)}
              y={isHighlighted ? 66 : 65}
              className="font-mono"
              fontSize={isHighlighted ? 16 : 13}
              fontWeight="500"
              fill="#fff"
            >
              {i + 1}
            </text>
            <text
              x={x(i)}
              y="108"
              fontSize="12"
              fontWeight={isHighlighted ? 700 : 400}
              fill={isHighlighted ? "#fff" : "#CDBCD6"}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
