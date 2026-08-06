import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Droplet, Heart } from "lucide-react";

const activities = [
  { id: 1, title: "Blood Pressure Logged", time: "2 hours ago", icon: Heart, color: "text-red-500", bg: "bg-red-100" },
  { id: 2, title: "Glucose Level Monitored", time: "5 hours ago", icon: Droplet, color: "text-blue-500", bg: "bg-blue-100" },
  { id: 3, title: "Daily Walk Completed", time: "1 day ago", icon: Activity, color: "text-green-500", bg: "bg-green-100" },
];

export function RecentActivity() {
  return (
    <Card className="bg-[#DDD4D8]">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex gap-4 relative">
                {index !== activities.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-300" />
                )}
                <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.bg}`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex flex-col pb-2">
                  <span className="text-sm font-semibold text-[#11222C]">{activity.title}</span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
