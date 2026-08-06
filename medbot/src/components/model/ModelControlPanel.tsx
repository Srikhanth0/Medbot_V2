import React from 'react';
import { RotateCcw, Move, ZoomIn } from 'lucide-react';
import useModelStore from '@/stores/modelStore';

export const ModelControlPanel: React.FC = () => {
  const {
    xPosition,
    yPosition,
    zoom,
    setXPosition,
    setYPosition,
    setZoom,
    resetControls,
  } = useModelStore();

  return (
    <div className="bg-[#11222C]/90 backdrop-blur-md border border-gray-700/60 rounded-xl p-3 text-white shadow-md text-xs mt-3">
      <div className="flex items-center justify-between border-b border-gray-700/60 pb-2 mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wide uppercase">
          <Move className="w-3.5 h-3.5" />
          <span>3D Viewer Controls</span>
        </div>
        <button
          onClick={resetControls}
          className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          title="Reset to default camera & position"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* X Position Slider (-5 to +5) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-gray-300">
            <span className="font-medium">X Position</span>
            <span className="font-mono font-bold text-cyan-400">
              {xPosition > 0 ? `+${xPosition.toFixed(1)}` : xPosition.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={xPosition}
            onChange={(e) => setXPosition(Number(e.target.value))}
            className="w-full accent-[#0891B2] bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Y Position Slider (-5 to +5) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-gray-300">
            <span className="font-medium">Y Position</span>
            <span className="font-mono font-bold text-cyan-400">
              {yPosition > 0 ? `+${yPosition.toFixed(1)}` : yPosition.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={yPosition}
            onChange={(e) => setYPosition(Number(e.target.value))}
            className="w-full accent-[#0891B2] bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Zoom Slider (0.5 to 3.0) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-gray-300">
            <span className="font-medium flex items-center gap-1">
              <ZoomIn className="w-3 h-3 text-cyan-400" />
              Zoom
            </span>
            <span className="font-mono font-bold text-cyan-400">{zoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#0891B2] bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default ModelControlPanel;
