/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "../../lib/utils";

export type VestLogoProps =
  React.SVGProps<SVGSVGElement> & {
    showSubtitle?: boolean;
    forceWhite?: boolean;
  };

export function VestLogo({
  className,
  showSubtitle = true,
  forceWhite = false,
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

      {/* V Shape Group - Centered when no subtitle */}
      <g
        filter="url(#v-shadow)"
        transform={
          !showSubtitle
            ? "translate(-10, 15)"
            : ""
        }
      >
        {/* Left stroke */}
        <path
          d="M51 75 L62 75 L79 116 L68 116 Z"
          fill={
            forceWhite
              ? "white"
              : "#E879F9"
          }
          fillOpacity={
            forceWhite ? 0.9 : 1
          }
        />
        {/* Right stroke */}
        <path
          d="M87 75 L98 75 L79 116 L68 116 Z"
          fill={
            forceWhite
              ? "white"
              : "#A21CAF"
          }
        />

        {/* Text "est" moved inside group to move together */}
        <text
          x="96"
          y="115"
          fill={
            forceWhite
              ? "white"
              : "#5B1187"
          }
          fontSize="55"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          textAnchor="start"
        >
          est
        </text>
      </g>

      {/* Text "REAL STATE" */}
      {showSubtitle && (
        <text
          x="121"
          y="148"
          fill={
            forceWhite
              ? "white"
              : "#5B1187"
          }
          fontSize="13"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
          letterSpacing="3"
          className="uppercase"
        >
          Real State
        </text>
      )}
    </svg>
  );
}
