import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const vestRealStateVariants = cva(
  "flex flex-col items-start justify-center p-4 rounded-md w-fit transition-colors",
  {
    variants: {
      theme: {
        dark: "bg-black text-white",
        light: "bg-white text-black border border-input shadow-sm",
        green: "bg-white text-brand-green border border-brand-green/20 shadow-sm",
        pink: "bg-white text-brand-pink border border-brand-pink/20 shadow-sm",
        "ghost-dark": "bg-transparent text-black hover:bg-black/5",
        "ghost-light": "bg-transparent text-white hover:bg-white/10",
        "ghost-green": "bg-transparent text-brand-green hover:bg-brand-green/10",
        "ghost-pink": "bg-transparent text-brand-pink hover:bg-brand-pink/10",
      },
    },
    defaultVariants: {
      theme: "dark",
    },
  }
);

export interface VestRealStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof vestRealStateVariants> {}

const VestRealState = React.forwardRef<HTMLDivElement, VestRealStateProps>(
  ({ className, theme, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(vestRealStateVariants({ theme, className }))}
        {...props}
      >
        <span className="text-4xl font-extrabold tracking-tighter leading-none">
          Vest
        </span>
        <span className="text-[0.6rem] font-medium tracking-[0.2em] uppercase ml-0.5 opacity-90">
          Real State
        </span>
      </div>
    );
  }
);
VestRealState.displayName = "VestRealState";

export { VestRealState, vestRealStateVariants };
