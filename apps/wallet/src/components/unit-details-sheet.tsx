import { ReactNode } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface UnitDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  title: string;
  price: string | number;
  stockText?: ReactNode;
  features?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
  isExpanded?: boolean;
  className?: string;
}

export function UnitDetailsSheet({
  isOpen,
  onClose,
  symbol,
  title,
  price,
  stockText,
  features,
  actions,
  children,
  isExpanded = false,
  className,
}: UnitDetailsSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 transition-colors duration-300",
        isExpanded
          ? "bg-background"
          : "bg-black/30 backdrop-blur-xs"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 transition-all duration-300 ease-in-out",
          isExpanded
            ? "top-0 p-0"
            : "p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        )}
      >
        <div
          className={cn(
            "relative bg-white shadow-2xl border border-border/40 flex flex-col transition-all duration-300",
            isExpanded
              ? "h-full rounded-none"
              : "p-5 rounded-[36px]",
            className
          )}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "absolute z-110 w-9 h-9 bg-white rounded-full border-none shadow-lg hover:bg-white/90 text-slate-500",
              isExpanded
                ? "top-6 right-6"
                : "top-6 right-6"
            )}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Content Container */}
          <div
            className={cn(
              "flex flex-col gap-6",
              isExpanded &&
                "h-full p-6 pt-20"
            )}
          >
            {/* Header Section */}
            <div className="flex flex-col shrink-0 min-h-[100px] mb-2 gap-3">
              {/* Row 1: Symbol and Title (full width) */}
              <div className="space-y-1">
                <div className="flex gap-2 items-center">
                  <span className="font-mono text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                    {symbol}
                  </span>
                </div>
                <h3 className="text-lg font-black text-foreground uppercase leading-tight tracking-tight">
                  {title}
                </h3>
              </div>

              {/* Row 2: Features and Price */}
              <div className="flex justify-between items-end gap-4">
                <div className="flex-1 min-w-0">
                  {features && (
                    <div className="flex flex-col gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {features}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-foreground tracking-tighter">
                    {typeof price === "number" ? `$${price.toFixed(2)}` : price}
                  </div>
                  {stockText && (
                    <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                      {stockText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && children && (
              <div className="flex-1 overflow-hidden min-h-0 -mx-2 px-2">
                {children}
              </div>
            )}

            {/* Actions */}
            <div className="shrink-0 mt-auto">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
