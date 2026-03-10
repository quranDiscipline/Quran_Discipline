import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  startOnViewport?: boolean;
  suffix?: string;
  prefix?: string;
  decimals?: number; // Number of decimal places to preserve
}

/**
 * Custom hook for animating number counting with requestAnimationFrame
 * Supports IntersectionObserver to start animation when element enters viewport
 * Respects prefers-reduced-motion for accessibility
 */
export function useCountUp({
  end,
  duration = 2000,
  startOnViewport = true,
  suffix = '',
  prefix = '',
  decimals = 0,
}: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnViewport);
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!startOnViewport) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [startOnViewport]);

  useEffect(() => {
    if (!isVisible) return;

    // If reduced motion is preferred, show final value immediately
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutExpo for smooth deceleration
      const easeOutExpo = (t: number): number => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      };

      const currentCount = easeOutExpo(progress) * end;
      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end exactly at the target
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, end, duration, prefersReducedMotion]);

  // Format with proper decimal places
  const formattedValue = `${prefix}${count.toFixed(decimals)}${suffix}`;

  return {
    count,
    elementRef,
    formattedValue,
  };
}
