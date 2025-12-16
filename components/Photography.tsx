import React, { useEffect, useState } from 'react';
import { TYPOGRAPHY, COLORS } from '../styles';

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

import { Language } from '../App';

interface PhotographyProps {
  language: Language;
}

const Photography: React.FC<PhotographyProps> = ({ language }) => {
  const [columnCount, setColumnCount] = useState(2);

  useEffect(() => {
    const updateColumnCount = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setColumnCount(4);
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  const splitPhotosIntoColumns = (count: number) => {
    const columns: (typeof photoAssets)[] = Array.from({ length: count }, () => []);
    photoAssets.forEach((photo, index) => {
      columns[index % count].push(photo);
    });
    return columns.map(col => [...col, ...col, ...col]);
  };

  const photoColumns = splitPhotosIntoColumns(columnCount);

  const renderColumn = (photos: (typeof photoAssets), columnIndex: number) => (
    <div key={columnIndex} className="overflow-hidden">
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `scroll-${columnIndex % 2 === 0 ? 'up' : 'down'} 60s linear infinite`,
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={`col${columnIndex}-${photo.id}-${index}`}
            className="rounded-lg overflow-hidden shadow-sm transition-all duration-300 group relative cursor-pointer border-2 border-transparent hover:border-gray-400"
            onMouseEnter={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) parent.style.animationPlayState = 'paused';
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) parent.style.animationPlayState = 'running';
            }}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-60"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className={`${TYPOGRAPHY.h3} text-gray-800 mb-1`}>{photo.title}</h3>
              <div className="w-8 h-px bg-gray-800 my-2"></div>
              <p className="text-sm text-gray-700 tracking-wide">{photo.artist}</p>
              <p className="text-sm text-gray-700 tracking-wide">{photo.season}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const intro = language === 'en' 
    ? 'Capturing moments of silence, texture, and light. A collection of works exploring the relationship between natural landscapes and human perception.'
    : '捕捉沉默、质感和光的瞬间。探索自然景观与人类感知之间关系的作品集。';

  return (
    <div id="photography-root" data-debug="photography-root" className="w-full">
      <div id="photography-header" data-debug="photography-header" className="mb-12 text-center">
        <p data-debug="photography-intro" className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          {intro}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[70vh]">
        {photoColumns.map((photos, index) => renderColumn(photos, index))}
      </div>
    </div>
  );
};

export default Photography;
