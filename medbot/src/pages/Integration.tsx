import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';
import { mockUploadZones } from '@/mock/integration';
import { uploadService } from '@/services/mock/uploadService';

/**
 * Integration Page Component (Matching Figma Desktop - 5.png)
 * 2 Side-by-Side Upload Cards with #7E8B91 Background
 */
export const IntegrationPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: string; summary: string } | null>(null);

  const handleFileUpload = async (type: 'ecg' | 'prescription') => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await uploadService.processFile(type);
      setScanResult({ type, summary: res.summary });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-wide">Integration</h1>
        <p className="text-gray-400 text-sm mt-1">
          Connect your data sources for a comprehensive health overview
        </p>
      </div>

      {/* 2 Upload Zones Grid matching Desktop - 5.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockUploadZones.map((zone) => (
          <div key={zone.id} className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-white tracking-wide">{zone.title}</h2>
            <p className="text-gray-400 text-sm">{zone.subtitle}</p>

            {/* Drop Zone matching #7E8B91 Figma style */}
            <div
              onClick={() => handleFileUpload(zone.id as 'ecg' | 'prescription')}
              className="bg-[#7E8B91] hover:bg-[#6c797f] rounded-2xl p-12 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg border-2 border-transparent hover:border-cyan-300 group"
            >
              <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold text-lg">Drag and drop your File</p>
              <p className="text-gray-200 text-xs mt-2">
                Supported: {zone.acceptedFormats.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* OCR Scan Result Modal / Feedback */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#122B36] border border-[#0891B2] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
          >
            <div className="w-8 h-8 border-4 border-[#0891B2] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-white font-bold text-sm">Processing Document with MedBot OCR...</p>
            <p className="text-gray-400 text-xs mt-1">Extracting clinical findings and metric updates</p>
          </motion.div>
        )}

        {scanResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#DDD4D8] border-l-4 border-[#16A34A] rounded-2xl p-6 text-[#11222C] shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              <h3 className="font-bold text-lg">
                {scanResult.type === 'ecg' ? 'ECG Analysis Result' : 'Prescription Scanned'}
              </h3>
            </div>
            <p className="text-sm leading-relaxed bg-white/80 p-4 rounded-xl font-mono border border-gray-300">
              {scanResult.summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Disclaimer matching Desktop - 5.png */}
      <div className="pt-4">
        <p className="text-xs text-gray-400 leading-relaxed max-w-4xl">
          Note: Ensure Files Are In A Compatible Format For OCR Processing. Supported Formats Include PDF And Image Files. For Assistance, Please Refer To Our Help Section.
        </p>
      </div>
    </motion.div>
  );
};

export default IntegrationPage;
