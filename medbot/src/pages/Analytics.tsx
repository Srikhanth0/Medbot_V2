import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { PatientCard } from '@/components/dashboard/PatientCard';
import { HealthPieChart } from '@/components/dashboard/HealthPieChart';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { mockPatient } from '@/mock/patient';
import { mockVitals } from '@/mock/vitals';
import { mockPieData } from '@/mock/dashboard';

/**
 * Analytics Page Component (Matching Figma Desktop - 4.png)
 * 3-Column layout:
 * - Col 1: Patient Card + Health Pie Chart
 * - Cols 2-3: 2x2 Grid of Vitals Cards (Blood Status, Heart Rate, Blood Count, Glucose Level)
 */
export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Health Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time vital statistics & physiological overview</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-[#122B36] p-1 rounded-xl border border-gray-700">
            {(['Weekly', 'Monthly', 'Yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  timeRange === t ? 'bg-[#0891B2] text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => alert('Exporting Health Report PDF...')}
            className="flex items-center gap-2 bg-[#DDD4D8] hover:bg-white text-[#11222C] font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Grid matching Desktop - 4.png */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Column 1: Patient Info Card + Health Overview Pie Chart */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <PatientCard patient={mockPatient} />
          <HealthPieChart data={mockPieData} />
        </div>

        {/* Columns 2-3: 2x2 Vitals Cards Grid */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockVitals.map((vital) => (
            <VitalsCard key={vital.id} vital={vital} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
