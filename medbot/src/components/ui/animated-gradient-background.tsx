import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface AnimatedGradientBackgroundProps {
  /** 
   * Initial size of the radial gradient, defining the starting width. 
   * @default 135
   */
  startingGap?: number;

  /**
   * Enables or disables the breathing animation effect.
   * @default true
   */
  Breathing?: boolean;

  /**
   * Enable Half-Crescent arc gradient mode.
   * @default false
   */
  isCrescent?: boolean;

  /**
   * Array of colors to use in the radial gradient.
   * Each color corresponds to a stop percentage in `gradientStops`.
   */
  gradientColors?: string[];

  /**
   * Array of percentage stops corresponding to each color in `gradientColors`.
   * The values should range between 0 and 100.
   */
  gradientStops?: number[];

  /**
   * Speed of the breathing animation. 
   * @default 0.025
   */
  animationSpeed?: number;

  /**
   * Maximum range for the breathing animation in percentage points.
   * @default 12
   */
  breathingRange?: number;

  /**
   * Center X percentage position of radial origin.
   * @default 50
   */
  centerX?: number;

  /**
   * Center Y percentage position of radial origin.
   * @default 50
   */
  centerY?: number;

  /**
   * Additional inline styles for the gradient container.
   */
  containerStyle?: React.CSSProperties;

  /**
   * Additional class names for the gradient container.
   */
  containerClassName?: string;

  /**
   * Additional top offset for the gradient container from the top.
   */
  topOffset?: number;
}

/**
 * AnimatedGradientBackground
 *
 * Renders a customizable animated radial/crescent gradient background with smooth breathing dynamics.
 */
export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 135,
  Breathing = true,
  isCrescent = true,
  gradientColors = [
    "#11222C",
    "#0891B2",
    "#16A34A",
    "#067a96",
    "#122B36",
    "#388E7B",
    "#11222C"
  ],
  gradientStops = [15, 35, 50, 68, 80, 92, 100],
  animationSpeed = 0.025,
  breathingRange = 12,
  centerX = 50,
  centerY = 90,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.
    Received gradientColors length: ${gradientColors.length},
    gradientStops length: ${gradientStops.length}`
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;

      if (!Breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(", ");

      const gradient = isCrescent
        ? `radial-gradient(ellipse ${width * 1.4}% ${width * 0.9}% at ${centerX}% ${centerY}%, ${gradientStopsString})`
        : `radial-gradient(${width}% ${width + topOffset}% at ${centerX}% ${centerY}%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);

    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, Breathing, isCrescent, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset, centerX, centerY]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{
        opacity: 0,
        scale: 1.1,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 1.5,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform pointer-events-none"
      />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
