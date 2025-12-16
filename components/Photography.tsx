import React, { useEffect, useState, useMemo } from 'react';
import { TYPOGRAPHY, COLORS } from '../styles';

// Portrait-oriented photos for waterfall layout with metadata
const photoAssets = [
  { src: 'https://media.yunwustudio.com/public/images/000P1070086.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/00P1010005-2.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/00P1010038.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/00P1010059.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1010008.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1010011.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1010085.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1010094.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1010097.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1010107.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1011787.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1030077.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1070016.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1070024-(2).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1070029.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1070032.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0P1070086.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0PB061357.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0PB061361.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0PB061364.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/0PB061365.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/1303310.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/414234988_3694550534109861_5675519163735921167_n.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010001.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010015.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010031.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010041.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010046.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010049.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010099.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010126.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010145_01.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010187.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010245.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1010303.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P10104660.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P10104670.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P10106160.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P1153011.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P6215165 (2).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P6245210 (2).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P808047400.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P80804780.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P92806960.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P92806990.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/P92807040.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PA0307630.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PA2012361.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PA2012370.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PB240858.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PB260920.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC091321.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC111458.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC131536.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC251997.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC252000.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC252003.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC252005.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/PC302136.JPG?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/Tinasdancestudios (2).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/Tinasdancestudios (5).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/Tinasdancestudios (7).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/Yun_Wu_2025 (12).jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
  { src: 'https://media.yunwustudio.com/public/images/_10102230.jpg?auto=format&fit=crop&w=600&h=900&q=80', alt: 'Portrait 1', title: 'Urban Essence', artist: 'Sarah Mitchell', season: 'Fall 2024' },
];

// Simple, fast string hash (djb2 variant) -> stable id string
function hashStringToId(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return 'p_' + (h >>> 0).toString(36);
}

import { Language } from '../App';

interface PhotographyProps {
  language: Language;
}

const Photography: React.FC<PhotographyProps> = ({ language }) => {
  const [columnCount, setColumnCount] = useState(2);

  const assetsWithIds = useMemo(() =>
    photoAssets.map(photo => ({ ...photo, id: hashStringToId(photo.src) })),
    []
  );

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
    const columns: any[] = Array.from({ length: count }, () => []);
    assetsWithIds.forEach((photo, index) => {
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
