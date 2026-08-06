import * as React from "react";
import { cn } from "@/utils/cn";

interface ReminderBadgeProps {
  type: "medication" | "appointment" | "water" | "exercise";
  label: string;
}

export function ReminderBadge({ type, label }: ReminderBadgeProps) {
  const styles = {
    medication: "bg-red-100 text-red-700 border-red-200",
    appointment: "bg-blue-100 text-blue-700 border-blue-200",
    water: "bg-cyan-100 text-cyan-700 border-cyan-200",
    exercise: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold", styles[type])}>
      {label}
    </div>
  );
}
