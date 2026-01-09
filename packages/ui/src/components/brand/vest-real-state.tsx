import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";
import { cn } from "../../lib/utils";

const vestRealStateVariants = cva(
  "flex flex-col items-start justify-center p-4 rounded-md w-fit transition-colors",
  {
    variants: {
      theme: {
        dark: "bg-black text-white",
        light:
          "bg-white text-black border border-input shadow-sm",
        green:
          "bg-white text-brand-green border border-brand-green/20 shadow-sm",
        pink: "bg-white text-brand-pink border border-brand-pink/20 shadow-sm",
        brand:
          "bg-white text-[#5B1187] border border-[#5B1187]/20 shadow-sm",
        "ghost-dark":
          "bg-transparent text-black hover:bg-black/5",
        "ghost-light":
          "bg-transparent text-white hover:bg-white/10",
        "ghost-green":
          "bg-transparent text-brand-green hover:bg-brand-green/10",
        "ghost-pink":
          "bg-transparent text-brand-pink hover:bg-brand-pink/10",
        "ghost-brand":
          "bg-transparent text-[#5B1187] hover:bg-[#5B1187]/10",
      },
    },
    defaultVariants: {
      theme: "dark",
    },
  }
);

export interface VestRealStateProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<
      typeof vestRealStateVariants
    > {
  withColors?: boolean;
}

const VestRealState = React.forwardRef<
  HTMLDivElement,
  VestRealStateProps
>(
  (
    {
      className,
      theme,
      withColors,
      ...props
    },
    ref
  ) => {
    const isBrand =
      theme === "brand" ||
      theme === "ghost-brand" ||
      withColors;

    const brandTextColor = "#5B1187";

    return (
      <div
        ref={ref}
        className={cn(
          vestRealStateVariants({
            theme,
            className,
          })
        )}
        style={
          isBrand
            ? { color: brandTextColor }
            : {}
        }
        {...props}
      >
        <span className="text-4xl font-extrabold tracking-tighter leading-none">
          {isBrand ? (
            <>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#E879F9] to-[#A21CAF]">
                V
              </span>
              <span>est</span>
            </>
          ) : (
            "Vest"
          )}
        </span>
        <span className="text-[0.6rem] font-medium tracking-[0.2em] uppercase ml-0.5 opacity-90">
          Real State
        </span>
      </div>
    );
  }
);
VestRealState.displayName =
  "VestRealState";

export {
  VestRealState,
  vestRealStateVariants,
};
