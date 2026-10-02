import {
  formatCurrency,
} from "@/lib/format";
import { ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { useIsOverlayDialog } from "@/hooks/use-media-query";
import { SHEET_LAYOUT_CLASS } from "@/components/responsive-overlay";

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

/**
 * Responsive container for unit details: bottom sheet below the overlay
 * breakpoint (md), centered dialog above it; `isExpanded` goes full-screen.
 * One Radix Dialog root for every mode (only layout classes change), so
 * resizing across md or toggling `isExpanded` never remounts the content.
 */
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
  const isDialog = useIsOverlayDialog();

  const body = (
    <div
      className={cn(
        "flex flex-col gap-6",
        isExpanded &&
          "h-full p-6 pt-20 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] short:h-auto short:min-h-full short:pt-12 short:gap-3"
      )}
    >
      {/* Header Section */}
      <div className="flex flex-col shrink-0 min-h-[100px] short:min-h-0 mb-2 short:mb-0 gap-3 short:gap-2 pr-8">
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <span className="font-mono text-[11px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
              {symbol}
            </span>
          </div>
          <DialogTitle className="text-lg font-black text-foreground uppercase leading-tight tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle de {symbol}
          </DialogDescription>
        </div>

        <div className="flex justify-between items-end gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            {features && (
              <div className="flex flex-col gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {features}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-foreground tracking-tighter">
              {typeof price === "number"
                ? formatCurrency(price)
                : price}
            </div>
            {stockText && (
              <div className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                {stockText}
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && children && (
        <div className="flex-1 overflow-hidden min-h-0 -mx-2 px-2 short:flex-none short:overflow-visible">
          {children}
        </div>
      )}

      <div className="sticky bottom-0 z-10 shrink-0 mt-auto bg-background">
        {actions}
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        layout={
          isExpanded
            ? "fullscreen"
            : isDialog
              ? "center"
              : "bottom"
        }
        className={cn(
          "gap-0",
          isExpanded
            ? "block p-0 rounded-none pt-[env(safe-area-inset-top)]"
            : isDialog
              ? "max-w-md p-5 md:rounded-[36px]"
              : cn(
                  SHEET_LAYOUT_CLASS,
                  "rounded-t-[36px] pt-4 sm:pt-5 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))]"
                ),
          className
        )}
      >
        {body}
      </DialogContent>
    </Dialog>
  );
}
