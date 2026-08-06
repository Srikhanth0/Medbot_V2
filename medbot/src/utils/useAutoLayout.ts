import { useEffect, useState } from 'react';

export interface ViewportMetrics {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  aspectRatio: number;
}

/**
 * useAutoLayout
 *
 * Custom utility hook that calculates viewport responsiveness metrics,
 * enforces dynamic viewport height (dvh), and eliminates negative scroll spaces.
 */
export function useAutoLayout(): ViewportMetrics {
  const [metrics, setMetrics] = useState<ViewportMetrics>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    aspectRatio: typeof window !== 'undefined' ? window.innerWidth / (window.innerHeight || 1) : 1.6,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Lock document body scroll overflow when full-screen auto-layout is active
      document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);

      setMetrics({
        width: w,
        height: h,
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1024,
        isDesktop: w >= 1024,
        aspectRatio: w / (h || 1),
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return metrics;
}

export default useAutoLayout;
