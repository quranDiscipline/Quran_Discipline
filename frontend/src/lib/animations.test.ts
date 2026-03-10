import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  scaleIn,
  fadeIn,
  slideInLeft,
  slideInRight,
  baseViewport,
  createVariants,
} from './animations';

// Mock the useReducedMotion hook for testing useAnimationProps
vi.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe('animations', () => {
  describe('baseViewport', () => {
    it('has correct once property', () => {
      expect(baseViewport.once).toBe(true);
    });

    it('has correct amount property', () => {
      expect(baseViewport.amount).toBe(0.2);
    });
  });

  describe('fadeUp variant', () => {
    it('has hidden state with opacity 0 and y offset', () => {
      expect(fadeUp.hidden).toEqual({
        opacity: 0,
        y: 30,
      });
    });

    it('has visible state with opacity 1 and no offset', () => {
      expect(fadeUp.visible.opacity).toBe(1);
      expect(fadeUp.visible.y).toBe(0);
    });

    it('has correct transition duration', () => {
      expect(fadeUp.visible.transition.duration).toBe(0.6);
    });

    it('has easeOut easing', () => {
      expect(fadeUp.visible.transition.ease).toBe('easeOut');
    });
  });

  describe('staggerContainer variant', () => {
    it('has hidden state with opacity 0', () => {
      expect(staggerContainer.hidden).toEqual({
        opacity: 0,
      });
    });

    it('has visible state with opacity 1', () => {
      expect(staggerContainer.visible.opacity).toBe(1);
    });

    it('has staggerChildren of 0.1', () => {
      expect(staggerContainer.visible.transition.staggerChildren).toBe(0.1);
    });

    it('has delayChildren of 0.1', () => {
      expect(staggerContainer.visible.transition.delayChildren).toBe(0.1);
    });
  });

  describe('staggerItem variant', () => {
    it('has hidden state with opacity 0 and y offset', () => {
      expect(staggerItem.hidden).toEqual({
        opacity: 0,
        y: 20,
      });
    });

    it('has visible state with opacity 1 and no offset', () => {
      expect(staggerItem.visible.opacity).toBe(1);
      expect(staggerItem.visible.y).toBe(0);
    });
  });

  describe('scaleIn variant', () => {
    it('has hidden state with opacity 0 and scale 0.9', () => {
      expect(scaleIn.hidden).toEqual({
        opacity: 0,
        scale: 0.9,
      });
    });

    it('has visible state with opacity 1 and scale 1', () => {
      expect(scaleIn.visible.opacity).toBe(1);
      expect(scaleIn.visible.scale).toBe(1);
    });

    it('has correct transition duration', () => {
      expect(scaleIn.visible.transition.duration).toBe(0.4);
    });
  });

  describe('fadeIn variant', () => {
    it('has hidden state with opacity 0', () => {
      expect(fadeIn.hidden).toEqual({
        opacity: 0,
      });
    });

    it('has visible state with opacity 1', () => {
      expect(fadeIn.visible.opacity).toBe(1);
    });

    it('has correct transition duration', () => {
      expect(fadeIn.visible.transition.duration).toBe(0.5);
    });
  });

  describe('slideInLeft variant', () => {
    it('has hidden state with opacity 0 and x offset', () => {
      expect(slideInLeft.hidden).toEqual({
        opacity: 0,
        x: -50,
      });
    });

    it('has visible state with opacity 1 and no offset', () => {
      expect(slideInLeft.visible.opacity).toBe(1);
      expect(slideInLeft.visible.x).toBe(0);
    });
  });

  describe('slideInRight variant', () => {
    it('has hidden state with opacity 0 and x offset', () => {
      expect(slideInRight.hidden).toEqual({
        opacity: 0,
        x: 50,
      });
    });

    it('has visible state with opacity 1 and no offset', () => {
      expect(slideInRight.visible.opacity).toBe(1);
      expect(slideInRight.visible.x).toBe(0);
    });
  });

  describe('createVariants', () => {
    it('returns original variants when prefersReducedMotion is false', () => {
      const originalVariants = fadeUp;
      const result = createVariants(originalVariants, false);

      expect(result).toEqual(originalVariants);
      expect(result.hidden).toEqual({
        opacity: 0,
        y: 30,
      });
    });

    it('returns variants with zero duration when prefersReducedMotion is true', () => {
      const originalVariants = fadeUp;
      const result = createVariants(originalVariants, true);

      // The visible variant should have zero duration
      expect(result.visible.transition.duration).toBe(0);
    });

    it('preserves all properties when prefersReducedMotion is false', () => {
      const originalVariants = scaleIn;
      const result = createVariants(originalVariants, false);

      expect(result.hidden.opacity).toBe(originalVariants.hidden.opacity);
      expect(result.hidden.scale).toBe(originalVariants.hidden.scale);
      expect(result.visible.opacity).toBe(originalVariants.visible.opacity);
      expect(result.visible.scale).toBe(originalVariants.visible.scale);
    });

    it('preserves properties but sets duration to 0 when prefersReducedMotion is true', () => {
      const originalVariants = scaleIn;
      const result = createVariants(originalVariants, true);

      expect(result.hidden.opacity).toBe(originalVariants.hidden.opacity);
      expect(result.hidden.scale).toBe(originalVariants.hidden.scale);
      expect(result.visible.opacity).toBe(originalVariants.visible.opacity);
      expect(result.visible.scale).toBe(originalVariants.visible.scale);
      expect(result.visible.transition.duration).toBe(0);
    });
  });
});
