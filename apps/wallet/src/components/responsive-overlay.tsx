"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@repo/ui/components/ui/dialog";
import { cn } from "@repo/ui/lib/utils";
import { useIsOverlayDialog } from "@/hooks/use-media-query";

/**
 * Bottom sheet below the overlay breakpoint (md), centered dialog above it.
 * See lib/breakpoints.ts.
 *
 * Both modes share one Radix Dialog root and only swap layout classes, so
 * resizing across md never remounts the children (local state, focus and
 * scroll position survive).
 */
const SIZE_CLASS = {
  sm: "md:max-w-sm",
  md: "md:max-w-md",
} as const;

/** Bottom sheet: landscape-safe insets; full height without rounding when short. */
export const SHEET_LAYOUT_CLASS =
  "max-h-[90dvh] rounded-t-3xl pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] short:max-h-dvh short:rounded-none";

const SheetCtx = React.createContext<boolean>(false);

interface ResponsiveOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  children: React.ReactNode;
}

export function ResponsiveOverlay({
  open,
  onOpenChange,
  size = "md",
  className,
  children,
}: ResponsiveOverlayProps) {
  const isDialog = useIsOverlayDialog();

  return (
    <SheetCtx.Provider value={!isDialog}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          layout={isDialog ? "center" : "bottom"}
          className={cn(
            isDialog
              ? cn("max-w-full", SIZE_CLASS[size])
              : SHEET_LAYOUT_CLASS,
            className
          )}
        >
          {children}
        </DialogContent>
      </Dialog>
    </SheetCtx.Provider>
  );
}

export function ResponsiveOverlayHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isSheet = React.useContext(SheetCtx);
  return <DialogHeader className={cn(isSheet && "space-y-2", className)} {...props} />;
}

/** `sticky` keeps the actions pinned to the bottom while the body scrolls. */
export function ResponsiveOverlayFooter({
  className,
  sticky = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { sticky?: boolean }) {
  return (
    <DialogFooter
      className={cn(sticky && "sticky bottom-0 z-10 bg-background pt-3", className)}
      {...props}
    />
  );
}

export function ResponsiveOverlayTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  const isSheet = React.useContext(SheetCtx);
  return (
    <DialogTitle
      className={cn(isSheet && "leading-normal tracking-normal text-foreground", className)}
      {...props}
    />
  );
}

export function ResponsiveOverlayDescription(
  props: React.ComponentPropsWithoutRef<typeof DialogDescription>
) {
  return <DialogDescription {...props} />;
}

export function ResponsiveOverlayClose(
  props: React.ComponentPropsWithoutRef<typeof DialogClose>
) {
  return <DialogClose {...props} />;
}
