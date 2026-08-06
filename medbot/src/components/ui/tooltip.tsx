import * as React from "react";
import { cn } from "@/utils/cn";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[#11222C] px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100",
          {
            "bottom-full left-1/2 mb-2 -translate-x-1/2": position === "top",
            "top-full left-1/2 mt-2 -translate-x-1/2": position === "bottom",
            "right-full top-1/2 mr-2 -translate-y-1/2": position === "left",
            "left-full top-1/2 ml-2 -translate-y-1/2": position === "right",
          },
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}
