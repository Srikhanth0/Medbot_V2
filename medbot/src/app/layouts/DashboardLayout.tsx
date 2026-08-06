import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopHeader } from '@/components/navigation/TopHeader';

/**
 * Main App Layout Wrapper for all authenticated routes.
 * Structure: Fixed Sidebar (Left) + TopHeader (Top) + Scrollable Main Outlet (Center)
 */
export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#11222C] text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
