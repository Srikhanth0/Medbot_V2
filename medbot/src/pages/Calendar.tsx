import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { EventModal } from '@/components/calendar/EventModal';
import { mockCalendar2026 } from '@/mock/calendar';
import { useCalendarStore } from '@/stores/calendarStore';

/**
 * Calendar Page Component (Matching Figma Desktop - 8.png)
 * Features "Calender" heading, "+ Add Reminder" pill button, 12 month grids with black event blocks
 */
export const CalendarPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const months = useCalendarStore((state) => state.months) || mockCalendar2026;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Top Header & Add Reminder Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-wide">Calender</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#DDD4D8] hover:bg-white text-[#11222C] font-bold px-6 py-2.5 rounded-full shadow-lg transition-all cursor-pointer border-2 border-gray-300"
        >
          <Plus className="w-5 h-5 text-[#11222C]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* 12-Month Responsive Grid matching Desktop - 8.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month) => (
          <MonthGrid key={month.month} month={month} />
        ))}
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </motion.div>
  );
};

export default CalendarPage;
