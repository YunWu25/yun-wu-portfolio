import React, { useEffect, useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../styles';

interface LightboxProps {
  isOpen: boolean;
  currentIndex: number;
  totalItems: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

type CursorZone = 'left' | 'center' | 'right';

const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  currentIndex,
  totalItems,
  imageUrl,
  title,
  subtitle,
  onClose,
  onNext,
  onPrev,
}) => {
  const [cursorZone, setCursorZone] = useState<CursorZone>('center');
  const [cursorDistance, setCursorDistance] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      onNext();
    } else if (e.key === 'ArrowLeft') {
      onPrev();
    }
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    const screenWidth = window.innerWidth;
    const zoneWidth = screenWidth / 3;
    const x = e.clientX;
    
    if (x < zoneWidth) {
      setCursorZone('left');
      const distanceFromEdge = x / zoneWidth;
      setCursorDistance(1 - distanceFromEdge);
    } else if (x > screenWidth - zoneWidth) {
      setCursorZone('right');
      const distanceFromEdge = (screenWidth - x) / zoneWidth;
      setCursorDistance(1 - distanceFromEdge);
    } else {
      setCursorZone('center');
      setCursorDistance(0);
    }
  };

  const handleContainerClick = () => {
    if (cursorZone === 'left') {
      onPrev();
    } else if (cursorZone === 'right') {
      onNext();
    } else {
      onClose();
    }
  };

  const getCursorStyle = () => {
    const baseSize = 40;
    const maxSize = 60;
    const size = baseSize + (cursorDistance * (maxSize - baseSize));
    
    return {
      width: `${size}px`,
      height: `${size}px`,
    };
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onMouseMove={handleContainerMouseMove}
      onClick={handleContainerClick}
    >
      {/* Close button */}
      <button
        onClick={() => {
          onClose();
        }}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Image container */}
      <div 
        className="max-w-[90vw] max-h-[90vh] flex flex-col items-center relative overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg transition-transform duration-300"
        />
        
        {/* Custom cursor indicator */}
        <div 
          className="fixed pointer-events-none transition-all duration-150 ease-out"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            ...getCursorStyle(),
          }}
        >
          {cursorZone === 'center' && (
            <div className={`w-full h-full border-2 border-dashed ${COLORS.borderCoral} opacity-70 rounded flex items-center justify-center`}>
              <div className={`w-4 h-4 ${COLORS.bgCoral} opacity-70 rounded-full`} />
            </div>
          )}
          {cursorZone === 'left' && (
            <div className={`w-full h-full flex items-center justify-center ${COLORS.coral} font-bold text-4xl`}>
              &lt;
            </div>
          )}
          {cursorZone === 'right' && (
            <div className={`w-full h-full flex items-center justify-center ${COLORS.coral} font-bold text-4xl`}>
              &gt;
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 text-center">
          <h3 className="text-white text-xl font-medium">{title}</h3>
          {subtitle && (
            <p className="text-white/70 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {totalItems}
      </div>
    </div>
  );
};

export default Lightbox;
