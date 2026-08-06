export type SparklineType = "bar" | "ecg" | "sine" | "zigzag";
export type VitalStatus = "Normal" | "Stable" | "Elevated" | "Low" | "Critical";

export interface VitalCard {
  id: string;
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  unit: string;
  status: VitalStatus | string;
  sparklineType: SparklineType;
  icon: string;
  color: {
    bg: string;
    text: string;
    badge: string;
    badgeText: string;
    stroke: string;
  };
}
