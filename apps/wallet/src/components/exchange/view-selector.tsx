"use client";

import { BarChart3, CandlestickChart, List } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface ViewSelectorProps {
  view: "linea" | "velas" | "ordenes";
  onViewChange: (view: "linea" | "velas" | "ordenes") => void;
}

export function ViewSelector({ view, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex gap-2 p-1 w-full rounded-2xl border backdrop-blur-md bg-white/5 border-white/10">
      <button
        type="button"
        onClick={() => onViewChange("linea")}
        className={cn(
          "flex-1 h-8 sm:h-9 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all",
          view === "linea"
            ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
            : "text-white/40 hover:text-white hover:bg-white/5"
        )}
      >
        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        LÍNEA
      </button>
      <button
        type="button"
        onClick={() => onViewChange("velas")}
        className={cn(
          "flex-1 h-8 sm:h-9 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all",
          view === "velas"
            ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
            : "text-white/40 hover:text-white hover:bg-white/5"
        )}
      >
        <CandlestickChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        VELAS
      </button>
      <button
        type="button"
        onClick={() => onViewChange("ordenes")}
        className={cn(
          "flex-1 h-8 sm:h-9 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 transition-all",
          view === "ordenes"
            ? "bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10"
            : "text-white/40 hover:text-white hover:bg-white/5"
        )}
      >
        <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ORDENES
      </button>
    </div>
  );
}
