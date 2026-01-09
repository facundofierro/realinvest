/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "../../lib/utils";

export type VestLogoProps =
  React.SVGProps<SVGSVGElement>;

export function VestLogo({
  className,
  ...props
}: VestLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={cn(
        "w-40 h-40",
        className
      )}
      {...props}
    >
      <defs>
        <filter
          id="v-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4"
            floodColor="black"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      {/* Background Circle */}
      <circle
        cx="100"
        cy="100"
        r="100"
        fill="#5B1187"
      />

      {/* V Shape Group */}
      <g filter="url(#v-shadow)">
        {/* Left stroke (Lighter Pink) */}
        <path
          d="M45 60 L70 60 L82 125 L57 125 Z"
          fill="#E879F9"
        />
        {/* Right stroke (Darker Purple) */}
        <path
          d="M80 60 L105 60 L93 125 L68 125 Z"
          fill="#A21CAF"
        />
      </g>

      {/* Text "est" */}
      <text
        x="108"
        y="115"
        fill="white"
        fontSize="55"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        textAnchor="start"
      >
        est
      </text>

      {/* Text "REAL STATE" */}
      <text
        x="100"
        y="155"
        fill="white"
        fontSize="13"
        fontWeight="600"
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
        letterSpacing="3"
        className="uppercase"
      >
        Real State
      </text>
    </svg>
  );
}
