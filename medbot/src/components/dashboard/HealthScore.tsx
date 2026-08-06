import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function HealthScore({ score = 92 }: { score?: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="bg-[#DDD4D8]">
      <CardContent className="flex flex-col items-center justify-center py-6">
        <h3 className="text-lg font-semibold text-[#11222C] mb-4">Overall Score</h3>
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              className="text-gray-300"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="64"
              cy="64"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-[#16A34A]"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="64"
              cy="64"
            />
          </svg>
          <div className="absolute text-3xl font-bold text-[#11222C]">
            {score}
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">Excellent Status</p>
      </CardContent>
    </Card>
  );
}
