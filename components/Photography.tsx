
import React from 'react';
import { TYPOGRAPHY, LAYOUT, COLORS } from '../styles';

// Mocking a list of assets from an "assets" folder
const photoAssets = [
  { id: 1, src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80', alt: 'Mountain landscape' },
  { id: 2, src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', alt: 'Sunset field' },
  { id: 3, src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80', alt: 'Forest trees' },
  { id: 4, src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', alt: 'Nature view' },
  { id: 5, src: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80', alt: 'Dark forest' },
  { id: 6, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', alt: 'Misty mountains' },
  { id: 7, src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', alt: 'Sunlight through trees' },
  { id: 8, src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80', alt: 'Valley view' },
  { id: 9, src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', alt: 'Starry night' }
];

const Photography: React.FC = () => {
  return (
    <div id="photography-root" data-debug="photography-root" className="w-full">
      <div id="photography-header" data-debug="photography-header" className="mb-12 text-center">
        <h2 className={TYPOGRAPHY.h2}>Visual Narratives</h2>
        <p data-debug="photography-intro" className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          Capturing moments of silence, texture, and light. A collection of works exploring the relationship between natural landscapes and human perception.
        </p>
      </div>

      {/* Masonry / Waterfall Grid using CSS columns */}
      <div id="photography-grid" data-debug="photography-grid" className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {photoAssets.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group relative"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Photography;
