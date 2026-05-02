import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useBubbleCollision } from './BubbleCollisionContext';

// Layout constants
const BUBBLE_SIZE = 56; // w-14 = 14 * 4 = 56px
const EDGE_PADDING = 8; // Minimum distance from viewport edge
const INITIAL_OFFSET = 32; // Initial position from edges (Tailwind's spacing-8)
const VIEWPORT_CONSTRAINT = BUBBLE_SIZE + EDGE_PADDING; // 64px

// Physics constants
const VELOCITY_DECAY = 0.97; // Velocity retained per frame (lower = stops faster)
const MIN_VELOCITY = 0.3; // Stop threshold
const BOUNCE_RESTITUTION = 0.8; // Velocity retained after edge bounce (lower = less bouncy)
const VELOCITY_SCALE = 16; // Scales velocity for ~60fps
const DRAG_THRESHOLD = 5; // Pixels moved before drag is recognized

const FloatingBubble: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [localIsDragging, setLocalIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [position, setPosition] = useState({ x: INITIAL_OFFSET, y: INITIAL_OFFSET * 3 + 16 });

  // Get context for broadcasting position
  const { setBubblePos, setIsDragging } = useBubbleCollision();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Constrain position to viewport
  const constrainPosition = useCallback((x: number, y: number) => {
    return {
      x: Math.max(EDGE_PADDING, Math.min(x, window.innerWidth - VIEWPORT_CONSTRAINT)),
      y: Math.max(EDGE_PADDING, Math.min(y, window.innerHeight - VIEWPORT_CONSTRAINT)),
    };
  }, []);

  // Momentum animation callback ref for self-reference
  const animateMomentumRef = useRef<() => void>(() => {});

  // Update momentum animation function in effect
  useEffect(() => {
    animateMomentumRef.current = () => {
      velocity.current.x *= VELOCITY_DECAY;
      velocity.current.y *= VELOCITY_DECAY;

      // Stop when velocity is negligible
      if (
        Math.abs(velocity.current.x) < MIN_VELOCITY &&
        Math.abs(velocity.current.y) < MIN_VELOCITY
      ) {
        animationRef.current = null;
        return;
      }

      setPosition((prev) => {
        const newPos = constrainPosition(prev.x + velocity.current.x, prev.y + velocity.current.y);

        // Bounce off edges
        if (newPos.x <= EDGE_PADDING || newPos.x >= window.innerWidth - VIEWPORT_CONSTRAINT) {
          velocity.current.x *= -BOUNCE_RESTITUTION;
        }
        if (newPos.y <= EDGE_PADDING || newPos.y >= window.innerHeight - VIEWPORT_CONSTRAINT) {
          velocity.current.y *= -BOUNCE_RESTITUTION;
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animateMomentumRef.current);
    };
  }, [constrainPosition]);

  // Broadcast position to context whenever it changes during drag or momentum
  useEffect(() => {
    if (localIsDragging || animationRef.current) {
      setBubblePos({
        x: position.x,
        y: position.y,
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
      });
    }
  }, [position, localIsDragging, setBubblePos]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return;

    // Cancel any ongoing momentum animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setLocalIsDragging(true);
    setIsDragging(true);
    setHasMoved(false);
    const rect = bubbleRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    startPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!bubbleRef.current || !e.touches[0]) return;

    // Cancel any ongoing momentum animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setLocalIsDragging(true);
    setIsDragging(true);
    setHasMoved(false);
    const rect = bubbleRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    lastTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!localIsDragging) return;

      // Check if moved more than threshold
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setHasMoved(true);
      }

      // Calculate velocity
      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        // Velocity is inverted because position is measured from right/bottom
        velocity.current = {
          x: (-(e.clientX - lastPos.current.x) / dt) * VELOCITY_SCALE,
          y: (-(e.clientY - lastPos.current.y) / dt) * VELOCITY_SCALE,
        };
      }
      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;

      const newX = window.innerWidth - e.clientX - (BUBBLE_SIZE - dragOffset.current.x);
      const newY = window.innerHeight - e.clientY - (BUBBLE_SIZE - dragOffset.current.y);

      setPosition(constrainPosition(newX, newY));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!localIsDragging || !e.touches[0]) return;

      // Check if moved more than threshold
      const dx = Math.abs(e.touches[0].clientX - startPos.current.x);
      const dy = Math.abs(e.touches[0].clientY - startPos.current.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setHasMoved(true);
      }

      // Calculate velocity
      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        velocity.current = {
          x: (-(e.touches[0].clientX - lastPos.current.x) / dt) * VELOCITY_SCALE,
          y: (-(e.touches[0].clientY - lastPos.current.y) / dt) * VELOCITY_SCALE,
        };
      }
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTime.current = now;

      const newX = window.innerWidth - e.touches[0].clientX - (BUBBLE_SIZE - dragOffset.current.x);
      const newY = window.innerHeight - e.touches[0].clientY - (BUBBLE_SIZE - dragOffset.current.y);

      setPosition(constrainPosition(newX, newY));
    };

    const handleMouseUp = () => {
      setLocalIsDragging(false);

      // Start momentum animation if there's velocity
      if (
        Math.abs(velocity.current.x) > MIN_VELOCITY ||
        Math.abs(velocity.current.y) > MIN_VELOCITY
      ) {
        animationRef.current = requestAnimationFrame(animateMomentumRef.current);
      } else {
        // No momentum, stop broadcasting
        setIsDragging(false);
      }
    };

    if (localIsDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [localIsDragging, constrainPosition, setIsDragging]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Stop dragging state when momentum ends
  useEffect(() => {
    const checkMomentumEnd = () => {
      if (!animationRef.current && !localIsDragging) {
        setIsDragging(false);
      }
    };

    // Check periodically
    const interval = setInterval(checkMomentumEnd, 100);
    return () => {
      clearInterval(interval);
    };
  }, [localIsDragging, setIsDragging]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if we actually moved (not just clicked)
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={bubbleRef}
      className="fixed z-50"
      style={{
        right: position.x,
        bottom: position.y,
        cursor: localIsDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Breathing glow */}
      <div
        className="absolute -inset-1 rounded-full bg-coral/25 animate-pulse"
        style={{ animationDuration: '2s' }}
      />

      <a
        href="https://www.ebay.com/usr/solarheart-studio"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`
          relative
          w-14 h-14 rounded-full
          bg-coral hover:bg-coral/90
          flex items-center justify-center
          shadow-md hover:shadow-lg
          transition-all duration-300
          ${isHovered && !localIsDragging ? 'scale-110' : 'scale-100'}
          ${localIsDragging ? 'cursor-grabbing' : ''}
        `}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        aria-label="Visit my eBay Store"
      >
        {/* Shopping Bag Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        {/* Tooltip - only show when not dragging */}
        {!localIsDragging && (
          <span
            className={`
              absolute right-16 top-1/2 -translate-y-1/2
              bg-gray-800 text-white text-xs
              px-3 py-1.5 rounded whitespace-nowrap
              transition-opacity duration-150
              pointer-events-none
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
          >
            eBay Store
          </span>
        )}
      </a>
    </div>
  );
};

export default FloatingBubble;
