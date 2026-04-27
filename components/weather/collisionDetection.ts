import { CollisionRect } from './types';

/** DOM selectors for collision surfaces */
const COLLISION_SELECTORS = [
  '#content-container',
  '#main-card-header',
  '#main-card-footer',
];

let cachedRects: CollisionRect[] = [];
let lastCacheTime = 0;
const CACHE_TTL = 500; // refresh every 500ms

/** Query and cache bounding rects of collision surfaces */
export const getCollisionRects = (): CollisionRect[] => {
  const now = Date.now();
  if (now - lastCacheTime < CACHE_TTL && cachedRects.length > 0) {
    return cachedRects;
  }

  const rects: CollisionRect[] = [];
  for (const selector of COLLISION_SELECTORS) {
    const el = document.querySelector(selector);
    if (el) {
      const r = el.getBoundingClientRect();
      rects.push({
        id: selector,
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
      });
    }
  }

  cachedRects = rects;
  lastCacheTime = now;
  return rects;
};

/** Check if a particle at (x, y) has hit any collision surface from above */
export const checkCollision = (
  x: number,
  y: number,
  prevY: number,
  rects: CollisionRect[]
): CollisionRect | null => {
  for (const rect of rects) {
    // Particle crossed the top edge of a rect while within horizontal bounds
    if (
      x >= rect.left &&
      x <= rect.right &&
      prevY <= rect.top &&
      y >= rect.top
    ) {
      return rect;
    }
  }
  return null;
};

/** Force refresh collision cache (call on resize) */
export const invalidateCollisionCache = (): void => {
  lastCacheTime = 0;
  cachedRects = [];
};
