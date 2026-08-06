import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieSlice } from "@/types";
import { mockPieData } from "@/mock/dashboard";

interface HealthPieChartProps {
  data?: PieSlice[];
}

export function HealthPieChart({ data = mockPieData }: HealthPieChartProps) {
  return (
    <div className="bg-[#DDD4D8] rounded-3xl p-6 shadow-lg border border-gray-300 text-[#11222C] flex flex-col items-center w-full">
      <h3 className="font-bold text-xl text-[#11222C] self-start mb-4 tracking-wide">
        Health Overview
      </h3>
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#11222C",
                borderColor: "#223c4a",
                color: "white",
                borderRadius: "0.75rem",
                borderWidth: "1px",
              }}
              itemStyle={{ color: "white" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Grid */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-300/80">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-bold text-[#11222C] truncate">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HealthPieChart;
