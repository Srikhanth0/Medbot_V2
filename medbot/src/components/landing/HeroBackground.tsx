import React from 'react';
import AnimatedOrbitalGradient from './AnimatedOrbitalGradient';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';

interface HeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full bg-[#11222C] text-white overflow-hidden ${className}`}>
      {/* Background Multi-Layer Composition */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Layer 1: Base Animated Orbital Light Glow */}
        <AnimatedOrbitalGradient />

        {/* Layer 2: Mid-to-Bottom Screen Resolution Animated Radial/Crescent Gradient with White/Cyan Glow */}
        <AnimatedGradientBackground
          startingGap={115}
          Breathing={true}
          isCrescent={true}
          centerX={50}
          centerY={90}
          gradientColors={[
            "rgba(255, 255, 255, 0.85)",
            "rgba(224, 242, 254, 0.5)",
            "rgba(6, 182, 212, 0.35)",
            "rgba(8, 145, 178, 0.15)",
            "rgba(17, 34, 44, 0)"
          ]}
          gradientStops={[0, 20, 45, 70, 100]}
          animationSpeed={0.02}
          breathingRange={8}
          containerClassName="opacity-90 mix-blend-screen"
        />

        {/* Layer 3: Noise Layer to prevent color banding */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Layer 4: Modern Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891B20a_1px,transparent_1px),linear-gradient(to_bottom,#0891B20a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default HeroBackground;
