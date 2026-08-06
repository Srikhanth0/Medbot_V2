import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import useAutoLayout from '@/utils/useAutoLayout';

/**
 * Authentication Layout Component
 * Fullscreen auto-layout container with top-left MedBot logo branding
 */
export const AuthLayout: React.FC = () => {
  useAutoLayout();

  return (
    <div className="h-screen w-full flex flex-col bg-[#11222C] relative overflow-hidden">
      {/* Radial ambient background glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none figma-bg-pattern bg-[radial-gradient(circle_at_center,_#0891B2_0%,_transparent_70%)]" />

      {/* Top Left Logo and MedBot Text */}
      <Link to="/" className="absolute top-6 left-6 lg:left-10 z-30 flex items-center gap-3 group cursor-pointer">
        <img src="/group-18.png" alt="MedBot Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
        <span className="text-xl font-bold text-white tracking-wide">MedBot</span>
      </Link>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
