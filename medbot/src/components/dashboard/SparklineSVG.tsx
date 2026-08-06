import * as React from "react";
import type { SparklineType } from "@/types/vitals";

interface SparklineProps {
  type: SparklineType;
  color: string;
  className?: string;
  data?: number[];
}

export function SparklineSVG({ type = "sine", color = "#0891B2", className = "w-full h-full" }: SparklineProps) {
  const paths: Record<SparklineType, string> = {
    bar: "M 10 30 V 10 M 25 30 V 5 M 40 30 V 15 M 55 30 V 8 M 70 30 V 22 M 85 30 V 12",
    ecg: "M 0 20 L 20 20 L 28 5 L 34 35 L 42 12 L 48 24 L 56 20 L 72 20 L 78 5 L 84 35 L 100 20",
    sine: "M 0 20 Q 25 0, 50 20 T 100 20",
    zigzag: "M 0 30 L 20 10 L 40 25 L 60 5 L 80 20 L 100 8",
  };

  return (
    <svg
      viewBox="0 0 100 40"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d={paths[type] || paths.sine}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default SparklineSVG;
