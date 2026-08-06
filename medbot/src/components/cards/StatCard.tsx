import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
  icon?: React.ReactNode;
}

export function StatCard({ label, value, trend, trendDirection, icon }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="bg-[#DDD4D8] border-none shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h4 className="text-2xl font-bold text-[#11222C]">{value}</h4>
            {trend && (
              <p className={`text-xs mt-1 ${trendDirection === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendDirection === "up" ? "↑" : "↓"} {trend}
              </p>
            )}
          </div>
          {icon && (
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#0891B2]">
              {icon}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
