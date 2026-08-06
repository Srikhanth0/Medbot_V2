import * as React from "react";
import { SparklineSVG } from "./SparklineSVG";
import type { VitalCard as VitalCardType } from "@/types/vitals";

interface VitalsCardProps {
  vital?: VitalCardType;
  title?: string;
  value?: string | number;
  secondaryValue?: number;
  unit?: string;
  status?: string;
  sparklineType?: "bar" | "ecg" | "sine" | "zigzag";
  color?: {
    bg: string;
    text: string;
    badge: string;
    badgeText: string;
    stroke: string;
  };
}

export function VitalsCard({ vital, title, value, secondaryValue, unit, status, sparklineType, color }: VitalsCardProps) {
  const item = vital || {
    id: "vital-1",
    title: title || "VITAL METRIC",
    value: value ?? 120,
    secondaryValue: secondaryValue,
    unit: unit || "BPM",
    status: (status as any) || "Normal",
    sparklineType: sparklineType || "sine",
    color: color || {
      bg: "#388E7B",
      text: "#FFFFFF",
      badge: "#22C55E",
      badgeText: "#FFFFFF",
      stroke: "#FFFFFF",
    },
    icon: "Activity",
  };

  const bgHeader = item.color?.bg || "#388E7B";

  return (
    <div className="bg-[#DDD4D8] rounded-3xl overflow-hidden shadow-lg border border-gray-300 flex flex-col justify-between">
      {/* Colored Header Bar matching Desktop - 4.png */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ backgroundColor: bgHeader }}
      >
        <h3 className="font-bold text-white uppercase text-base tracking-wide flex items-center gap-2">
          {item.title}
        </h3>
        <span className="text-white font-bold text-sm">
          {item.value}
          {item.secondaryValue ? `/${item.secondaryValue}` : ""} {item.unit}
        </span>
      </div>

      {/* Body: White Card Inner Container */}
      <div className="p-5 flex items-center justify-between gap-4">
        {/* Sparkline Graphic */}
        <div className="flex-1 h-14 flex items-center">
          <SparklineSVG
            type={item.sparklineType || "sine"}
            color={bgHeader}
            className="w-full h-full"
          />
        </div>

        {/* Right Colored Badge Box matching Figma Desktop - 4.png */}
        <div
          className="rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-[80px] shadow-md"
          style={{ backgroundColor: bgHeader }}
        >
          <span className="text-2xl font-extrabold text-white leading-none">
            {item.value}
          </span>
          {item.secondaryValue && (
            <span className="text-xs text-white/80 font-bold mt-0.5">
              /{item.secondaryValue}
            </span>
          )}
          {!item.secondaryValue && (
            <span className="text-xs text-white/80 font-bold mt-0.5">
              {item.unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default VitalsCard;
