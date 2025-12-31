"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ReactNode } from "react";

export interface UnitAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

interface UnitDetailsActionsProps {
  actions: UnitAction[];
}

export function UnitDetailsActions({ actions }: UnitDetailsActionsProps) {
  return (
    <div className="flex gap-2 w-full mt-auto">
      {actions.map((action, idx) => {
        const isLast = idx === actions.length - 1;
        
        let variant: "default" | "outline" | "secondary" = "outline";
        let className = "flex-1 h-12 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all";
        
        if (action.variant === "primary" || isLast) {
          variant = "default";
          className = cn(
            className, 
            "flex-[1.5] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95"
          );
        } else if (action.variant === "secondary") {
          variant = "secondary";
          className = cn(
            className, 
            "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          );
        } else {
          variant = "outline";
          className = cn(
            className, 
            "border-border hover:bg-muted/50 hover:text-foreground"
          );
        }

        return (
          <Button
            key={action.label}
            variant={variant}
            disabled={action.disabled}
            className={cn(className, action.className)}
            onClick={action.onClick}
          >
            {action.icon && <span className="mr-1.5">{action.icon}</span>}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
