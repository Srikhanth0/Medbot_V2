import React from 'react';

interface GlowLayerProps {
  color: string;
  size: string; // e.g. 'w-[600px] h-[600px]' or 'w-[1000px] h-[1000px]'
  position: string; // e.g. 'top-1/4 left-1/2 -translate-x-1/2'
  blur: string; // e.g. 'blur-[120px]' or 'blur-[160px]'
  opacity?: number;
  animationClass?: string;
  className?: string;
}

export const GlowLayer: React.FC<GlowLayerProps> = ({
  color,
  size,
  position,
  blur,
  opacity = 0.6,
  animationClass = '',
  className = '',
}) => {
  return (
    <div
      className={`absolute rounded-full pointer-events-none transform-gpu ${size} ${position} ${blur} ${animationClass} ${className}`}
      style={{
        background: color,
        opacity,
        willChange: 'transform, opacity',
      }}
    />
  );
};

export default GlowLayer;
