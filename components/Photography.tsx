

import React, { useEffect, useRef } from 'react';
import { TYPOGRAPHY, LAYOUT, COLORS } from '../styles';

// Portrait-oriented photos for waterfall layout with metadata
const photoAssets = [
  { id: 1, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { id: 2, src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 2', title: 'Minimal Grace', artist: 'James Chen', season: 'Winter 2024' },
  { id: 3, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 3', title: 'Golden Hour', artist: 'Emma Rodriguez', season: 'Spring 2025' },
  { id: 4, src: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 4', title: 'Quiet Moments', artist: 'David Park', season: 'Summer 2024' },
  { id: 5, src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 5', title: 'Natural Light', artist: 'Lisa Anderson', season: 'Fall 2024' },
  { id: 6, src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 6', title: 'Studio Portrait', artist: 'Michael Wong', season: 'Winter 2024' },
  { id: 7, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 7', title: 'Classic Style', artist: 'Sophie Laurent', season: 'Spring 2025' },
  { id: 8, src: 'https://images.unsplash.com/photo-1530785602389-07594beb8b73?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 8', title: 'Modern Lines', artist: 'Alex Thompson', season: 'Summer 2024' },
  { id: 9, src: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 9', title: 'Soft Focus', artist: 'Nina Patel', season: 'Fall 2024' },
  { id: 10, src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 10', title: 'Editorial Look', artist: 'Ryan Lee', season: 'Winter 2024' },
  { id: 11, src: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 11', title: 'Raw Beauty', artist: 'Maya Johnson', season: 'Spring 2025' },
  { id: 12, src: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 12', title: 'Timeless', artist: 'Carlos Martinez', season: 'Summer 2024' },
  { id: 13, src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 13', title: 'Urban Chic', artist: 'Anna Kim', season: 'Fall 2024' },
  { id: 14, src: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 14', title: 'Natural Beauty', artist: 'Tom Wilson', season: 'Winter 2024' },
  { id: 15, src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 15', title: 'Ethereal', artist: 'Grace Zhang', season: 'Spring 2025' },
  { id: 16, src: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 16', title: 'Bold Statement', artist: 'Marcus Brown', season: 'Summer 2024' },
  { id: 17, src: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 17', title: 'Serene', artist: 'Olivia Davis', season: 'Fall 2024' },
  { id: 18, src: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 18', title: 'Contemporary', artist: 'Daniel White', season: 'Winter 2024' },
];

const Photography: React.FC = () => {
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const leftScrollPositionRef = useRef(0);
  const rightScrollPositionRef = useRef(0);
  const leftAnimatingRef = useRef(true);
  const rightAnimatingRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;

    // Initialize right column to start from middle of content (so content is above viewport)
    if (!initializedRef.current && rightColumnRef.current) {
      const rightHeight = rightColumnRef.current.scrollHeight / 3;
      rightScrollPositionRef.current = -rightHeight;
      rightColumnRef.current.style.transform = `translateY(${rightScrollPositionRef.current}px)`;
      initializedRef.current = true;
    }

    const animate = () => {
      if (leftColumnRef.current && leftAnimatingRef.current) {
        // Left column scrolls up
        leftScrollPositionRef.current -= 0.5;
        const leftHeight = leftColumnRef.current.scrollHeight / 3;

        if (Math.abs(leftScrollPositionRef.current) >= leftHeight) {
          leftScrollPositionRef.current = 0;
        }
        leftColumnRef.current.style.transform = `translateY(${leftScrollPositionRef.current}px)`;
      }

      if (rightColumnRef.current && rightAnimatingRef.current) {
        // Right column scrolls down
        rightScrollPositionRef.current += 0.5;
        const rightHeight = rightColumnRef.current.scrollHeight / 3;

        // Loop back when reaching the starting position
        if (rightScrollPositionRef.current >= 0) {
          rightScrollPositionRef.current = -rightHeight;
        }
        rightColumnRef.current.style.transform = `translateY(${rightScrollPositionRef.current}px)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleLeftMouseEnter = () => {
      leftAnimatingRef.current = false;
    };

    const handleLeftMouseLeave = () => {
      leftAnimatingRef.current = true;
    };

    const handleRightMouseEnter = () => {
      rightAnimatingRef.current = false;
    };

    const handleRightMouseLeave = () => {
      rightAnimatingRef.current = true;
    };

    const leftContainer = leftColumnRef.current?.parentElement;
    const rightContainer = rightColumnRef.current?.parentElement;

    if (leftContainer) {
      leftContainer.addEventListener('mouseenter', handleLeftMouseEnter);
      leftContainer.addEventListener('mouseleave', handleLeftMouseLeave);
    }

    if (rightContainer) {
      rightContainer.addEventListener('mouseenter', handleRightMouseEnter);
      rightContainer.addEventListener('mouseleave', handleRightMouseLeave);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (leftContainer) {
        leftContainer.removeEventListener('mouseenter', handleLeftMouseEnter);
        leftContainer.removeEventListener('mouseleave', handleLeftMouseLeave);
      }
      if (rightContainer) {
        rightContainer.removeEventListener('mouseenter', handleRightMouseEnter);
        rightContainer.removeEventListener('mouseleave', handleRightMouseLeave);
      }
    };
  }, []);

  // Split photos into two separate columns (first 9 and last 9) and triple them for infinite scroll
  const leftPhotos = [...photoAssets.slice(0, 9), ...photoAssets.slice(0, 9), ...photoAssets.slice(0, 9)];
  const rightPhotos = [...photoAssets.slice(9, 18), ...photoAssets.slice(9, 18), ...photoAssets.slice(9, 18)];

  return (
    <div id="photography-root" data-debug="photography-root" className="w-full">
      <div id="photography-header" data-debug="photography-header" className="mb-12 text-center">
        <p data-debug="photography-intro" className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          Capturing moments of silence, texture, and light. A collection of works exploring the relationship between natural landscapes and human perception.
        </p>
      </div>

      {/* Waterfall Grid with infinite scroll */}
      <div className="grid grid-cols-2 gap-4 h-[70vh]">
        {/* Left Column - Scrolls Up */}
        <div className="overflow-hidden overflow-x-hidden">
          <div ref={leftColumnRef} className="flex flex-col gap-4">
            {leftPhotos.map((photo, index) => (
              <div
                key={`left-${photo.id}-${index}`}
                className="rounded-lg overflow-hidden shadow-sm transition-all duration-300 group relative cursor-pointer border-2 border-transparent hover:border-gray-400"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-medium text-gray-800 mb-1">{photo.title}</h3>
                  <div className="w-8 h-px bg-gray-800 my-2"></div>
                  <p className="text-sm text-gray-700 tracking-wide">{photo.artist}</p>
                  <p className="text-sm text-gray-700 tracking-wide">{photo.season}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Scrolls Down */}
        <div className="overflow-hidden overflow-x-hidden">
          <div ref={rightColumnRef} className="flex flex-col gap-4">
            {rightPhotos.map((photo, index) => (
              <div
                key={`right-${photo.id}-${index}`}
                className="rounded-lg overflow-hidden shadow-sm transition-all duration-300 group relative cursor-pointer border-2 border-transparent hover:border-gray-400"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-medium text-gray-800 mb-1">{photo.title}</h3>
                  <div className="w-8 h-px bg-gray-800 my-2"></div>
                  <p className="text-sm text-gray-700 tracking-wide">{photo.artist}</p>
                  <p className="text-sm text-gray-700 tracking-wide">{photo.season}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photography;

