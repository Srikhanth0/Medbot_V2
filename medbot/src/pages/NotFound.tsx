import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

/**
 * 404 Error Page Component
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#11222C] flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
      <div className="absolute inset-0 figma-bg-pattern opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10"
      >
        <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-[#11222C] leading-none select-none drop-shadow-2xl">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#0891B2] rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
      </motion.div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mt-8 space-y-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The medical record or page you are looking for does not exist or has been moved.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#0891B2] hover:bg-[#067a96] text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0891B2]/20"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};
export default NotFound;
