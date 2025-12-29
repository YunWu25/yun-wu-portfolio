import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface BubblePosition {
  x: number;  // from right edge
  y: number;  // from bottom edge
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

// Hook for elements that can be "hit" by the bubble
export const useWobbleOnCollision = (ref: React.RefObject<HTMLElement | null>) => {
  const { bubblePos, isDragging } = useBubbleCollision();
  const [isWobbling, setIsWobbling] = useState(false);
  const lastCollision = useRef(0);
  const COLLISION_COOLDOWN = 500; // ms between wobbles

  useEffect(() => {
    if (!ref.current || !bubblePos || !isDragging || isWobbling) return;

    const now = Date.now();
    if (now - lastCollision.current < COLLISION_COOLDOWN) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Convert bubble position (from right/bottom) to absolute coordinates
    const bubbleLeft = window.innerWidth - bubblePos.x - bubblePos.width;
    const bubbleTop = window.innerHeight - bubblePos.y - bubblePos.height;
    const bubbleRight = bubbleLeft + bubblePos.width;
    const bubbleBottom = bubbleTop + bubblePos.height;

    // Check collision
    const isColliding = !(
      bubbleRight < rect.left ||
      bubbleLeft > rect.right ||
      bubbleBottom < rect.top ||
      bubbleTop > rect.bottom
    );

    if (isColliding) {
      lastCollision.current = now;
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setIsWobbling(true);
      });
    }
  }, [bubblePos, isDragging, isWobbling, ref]);

  // Reset wobble after animation completes
  useEffect(() => {
    if (!isWobbling) return;
    
    const timer = setTimeout(() => {
      setIsWobbling(false);
    }, 600);
    
    return () => { clearTimeout(timer); };
  }, [isWobbling]);

  return isWobbling;
};

// Wrapper component for elements that wobble on collision
export const WobbleOnHit: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isWobbling = useWobbleOnCollision(ref);

  return (
    <span
      ref={ref}
      className={`inline-block transition-transform ${className} ${
        isWobbling ? 'animate-wobble' : ''
      }`}
    >
      {children}
    </span>
  );
};
