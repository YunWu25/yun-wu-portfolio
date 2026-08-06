/**
 * Application constants
 * Centralized configuration values for maintainability and consistency
 */

/**
 * Marquee animation configuration for brand logo carousel
 * Used in About.tsx for the infinite scrolling brand display
 */
export const MARQUEE = {
  /** Number of times to repeat brand logos for seamless infinite scroll */
  REPETITIONS: 50,
  /** Total animation duration in seconds - longer = slower scroll */
  ANIMATION_DURATION: 450,
} as const;

/**
 * Scroll interaction thresholds for splash screen transitions
 * These values control the sensitivity of scroll/swipe gestures
 */
export const SCROLL_THRESHOLDS = {
  /** Minimum milliseconds between scroll events to prevent jittery state changes */
  WHEEL_DEBOUNCE_MS: 1200,
  /** Minimum deltaY pixels to trigger scroll-down action (hide splash) */
  SCROLL_DOWN_THRESHOLD: 50,
  /** Minimum milliseconds between touch events */
  TOUCH_DEBOUNCE_MS: 1000,
  /** Minimum swipe distance in pixels to trigger swipe-up (hide splash) */
  SWIPE_UP_THRESHOLD: 50,
} as const;
