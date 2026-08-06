import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarMonth } from "@/types/calendar";

interface MonthGridProps {
  month: CalendarMonth;
}

export function MonthGrid({ month }: MonthGridProps) {
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const daysInMonth = month.daysInMonth || 30;
  const startDay = month.startDay || 0;
  const eventDays = (month.events || []).map((e) => e.day);

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - startDay + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  return (
    <div className="bg-white rounded-xl p-3 shadow-md border border-gray-200 text-gray-900 flex flex-col justify-between">
      <div>
        {/* Month Header with Navigation Arrows matching Desktop - 8.png */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-bold text-gray-900 text-sm">
            {month.month}
          </span>
          <div className="flex items-center gap-1.5 text-gray-600">
            <button className="hover:text-black transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="hover:text-black transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Headers (S M T W T F S) */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-xs font-bold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid matching Figma black square highlight */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const isEventDay = eventDays.includes(day);

            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-xs rounded-sm transition-colors cursor-pointer ${
                  isEventDay
                    ? "bg-black text-white font-bold shadow-sm"
                    : "text-gray-800 hover:bg-gray-100 font-medium"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MonthGrid;
