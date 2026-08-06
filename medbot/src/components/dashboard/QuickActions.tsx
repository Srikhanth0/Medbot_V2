import * as React from "react";
import { Button } from "@/components/ui/button";
import { Activity, CalendarPlus, FileText } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="secondary" className="gap-2 rounded-full px-6 bg-white hover:bg-gray-50 shadow-sm border text-[#11222C]">
        <Activity className="h-4 w-4 text-red-500" />
        Log Vitals
      </Button>
      <Button variant="secondary" className="gap-2 rounded-full px-6 bg-white hover:bg-gray-50 shadow-sm border text-[#11222C]">
        <CalendarPlus className="h-4 w-4 text-blue-500" />
        Book Appointment
      </Button>
      <Button variant="secondary" className="gap-2 rounded-full px-6 bg-white hover:bg-gray-50 shadow-sm border text-[#11222C]">
        <FileText className="h-4 w-4 text-green-500" />
        Scan Report
      </Button>
    </div>
  );
}
