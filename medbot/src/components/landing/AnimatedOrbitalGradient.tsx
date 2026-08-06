import React from 'react';
import { motion } from 'framer-motion';
import GlowLayer from './GlowLayer';

interface AnimatedOrbitalGradientProps {
  className?: string;
}

export const AnimatedOrbitalGradient: React.FC<AnimatedOrbitalGradientProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden pointer-events-none ${className}`}>
      {/* Container holding GPU-accelerated rotating and breathing light fields */}
      <motion.div
        animate={{
          scale: [1, 1.08, 0.96, 1],
          rotate: [0, 15, -10, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 w-full h-full transform-gpu"
      >
        {/* Layer 1: Massive primary Cyan Orbital Bloom (#0891B2 / #06B6D4) */}
        <GlowLayer
          color="radial-gradient(circle, rgba(6,182,212,0.45) 0%, rgba(8,145,178,0.25) 55%, transparent 80%)"
          size="w-[900px] h-[900px] sm:w-[1200px] sm:h-[1200px]"
          position="top-[-200px] left-1/2 -translate-x-1/2"
          blur="blur-[130px]"
          opacity={0.8}
        />

        {/* Layer 2: Secondary Sky Blue Glow (#0EA5E9) Offset Diagonally */}
        <GlowLayer
          color="radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(8,145,178,0.15) 60%, transparent 85%)"
          size="w-[700px] h-[700px] sm:w-[1000px] sm:h-[1000px]"
          position="top-1/4 left-[20%]"
          blur="blur-[140px]"
          opacity={0.65}
        />

        {/* Layer 3: Large Emerald Glow (#10B981 / #22C55E) from Bottom/Right */}
        <GlowLayer
          color="radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(34,197,94,0.15) 55%, transparent 80%)"
          size="w-[800px] h-[800px] sm:w-[1100px] sm:h-[1100px]"
          position="bottom-[-150px] right-[15%]"
          blur="blur-[150px]"
          opacity={0.6}
        />

        {/* Layer 4: Orbital Floating Accent Light (#06B6D4) */}
        <GlowLayer
          color="radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)"
          size="w-[500px] h-[500px] sm:w-[750px] sm:h-[750px]"
          position="top-[40%] left-[55%]"
          blur="blur-[110px]"
          opacity={0.5}
        />
      </motion.div>

      {/* Layer 5: Dark Central Void Core to keep text and center dark blue */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(17,34,44,0.35)_0%,rgba(17,34,44,0.85)_65%,rgba(17,34,44,1)_100%)] pointer-events-none" />

      {/* Layer 6: Soft Outer Vignette for smooth integration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_50%,#11222C_100%)] pointer-events-none opacity-90" />
    </div>
  );
};

export default AnimatedOrbitalGradient;
