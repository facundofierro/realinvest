import * as React from "react";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";
import { cn } from "../../lib/utils";

const vestRealStateVariants = cva(
  "grid grid-cols-1 justify-items-center p-4 rounded-md w-fit transition-colors",
  {
    variants: {
      theme: {
        dark: "bg-black text-white",
        light:
          "bg-white text-black border border-input shadow-sm",
        brand:
          "bg-white text-[#5B1187] border border-[#5B1187]/20 shadow-sm rounded-4xl p-3",
        "ghost-dark":
          "bg-transparent text-black hover:bg-black/5",
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
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#A21CAF] to-[#5B1187]">
              Vest
            </span>
          ) : (
            "Vest"
          )}
        </span>
        <div className="text-[0.6rem] font-medium tracking-[0.2em] uppercase opacity-90 justify-self-stretch text-left pl-3">
          Real State
        </div>
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
