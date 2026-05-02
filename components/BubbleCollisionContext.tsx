import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface BubblePosition {
  x: number; // from right edge
  y: number; // from bottom edge
  width: number;
  height: number;
}

interface CollisionContextValue {
  bubblePos: BubblePosition | null;
  setBubblePos: (pos: BubblePosition | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const BubbleCollisionContext = createContext<CollisionContextValue | null>(null);

export const BubbleCollisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bubblePos, setBubblePos] = useState<BubblePosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <BubbleCollisionContext.Provider value={{ bubblePos, setBubblePos, isDragging, setIsDragging }}>
      {children}
    </BubbleCollisionContext.Provider>
  );
};

export const useBubbleCollision = () => {
  const context = useContext(BubbleCollisionContext);
  if (!context) {
    throw new Error('useBubbleCollision must be used within BubbleCollisionProvider');
  }
  return context;
};

// Global collision detection hook - queries all [data-wobble-target] elements
export const useGlobalWobbleCollision = () => {
  const { bubblePos, isDragging } = useBubbleCollision();
  const lastCollisionMap = useRef<Map<Element, number>>(new Map());
  const COLLISION_COOLDOWN = 500; // ms between wobbles per element

  useEffect(() => {
    if (!bubblePos || !isDragging) return;

    const now = Date.now();

    // Convert bubble position (from right/bottom) to absolute coordinates
    const bubbleLeft = window.innerWidth - bubblePos.x - bubblePos.width;
    const bubbleTop = window.innerHeight - bubblePos.y - bubblePos.height;
    const bubbleRight = bubbleLeft + bubblePos.width;
    const bubbleBottom = bubbleTop + bubblePos.height;

    // Query all wobble targets
    const targets = document.querySelectorAll('[data-wobble-target]');

    targets.forEach((el) => {
      // Check cooldown for this element
      const lastHit = lastCollisionMap.current.get(el) ?? 0;
      if (now - lastHit < COLLISION_COOLDOWN) return;

      // Skip if already wobbling
      if (el.classList.contains('animate-wobble')) return;

      const rect = el.getBoundingClientRect();

      // Check collision
      const isColliding = !(
        bubbleRight < rect.left ||
        bubbleLeft > rect.right ||
        bubbleBottom < rect.top ||
        bubbleTop > rect.bottom
      );

      if (isColliding) {
        lastCollisionMap.current.set(el, now);
        el.classList.add('animate-wobble');

        // Remove class after animation completes
        setTimeout(() => {
          el.classList.remove('animate-wobble');
        }, 600);
      }
    });
  }, [bubblePos, isDragging]);
};
