import { Variants } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Animation variants for Framer Motion
 * All variants respect the user's prefers-reduced-motion setting
 */

/**
 * Base viewport configuration for one-time animations
 */
export const baseViewport = {
  once: true,
  amount: 0.2 as const, // Trigger when 20% of element is visible
};

/**
 * Fade up animation - element fades in and moves up
 */
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Stagger container for animating children in sequence
 * Wraps items that should animate one after another
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Individual stagger item - use with staggerContainer
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale in animation - element scales up from smaller size
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Fade in animation - simple opacity fade
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide from left animation
 */
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide from right animation
 */
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Get animation props that respect prefers-reduced-motion
 * Use this to dynamically disable animations based on user preference
 */
export function useAnimationProps() {
  const prefersReducedMotion = useReducedMotion();

  return {
    viewport: baseViewport,
    initial: prefersReducedMotion ? 'visible' : 'hidden',
    whileInView: prefersReducedMotion ? 'visible' : undefined,
    variants: prefersReducedMotion
      ? {
          visible: { opacity: 1, y: 0, scale: 1, x: 0 },
        }
      : undefined,
  };
}

/**
 * Helper to create reduced-motion-aware variants
 * When reduced motion is preferred, overrides duration to 0
 */
export function createVariants<T extends Variants>(
  variants: T,
  prefersReducedMotion: boolean
): T {
  if (!prefersReducedMotion) {
    return variants;
  }

  // Return variants with zero duration for all transitions
  const reducedVariants = {} as any;
  for (const key in variants) {
    const variant = variants[key];
    reducedVariants[key] = {
      ...variant,
      transition: {
        ...(typeof variant === 'object' && variant && 'transition' in variant
          ? (variant as any).transition
          : {}),
        duration: 0,
      },
    };
  }
  return reducedVariants as T;
}
