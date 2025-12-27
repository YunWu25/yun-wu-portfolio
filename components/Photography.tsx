import React, { useEffect, useState } from 'react';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';

interface PhotoData {
  key: string;
  url: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
}

interface PhotographyProps {
  language: Language;
}

const Photography: React.FC<PhotographyProps> = ({ language }) => {
  const [columnCount, setColumnCount] = useState(2);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos from API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PhotoData[] = await response.json();
        if (data.length === 0) {
          setError('No photos available');
        } else {
          setPhotos(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch photos:', err);
        setError('Failed to load photos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchPhotos();
  }, []);

  // Handle responsive column count
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
    return () => { window.removeEventListener('resize', updateColumnCount); };
  }, []);

  const splitPhotosIntoColumns = (count: number) => {
    const columns: PhotoData[][] = Array.from({ length: count }, () => []);
    photos.forEach((photo, index) => {
      const columnIndex = index % count;
      columns[columnIndex]?.push(photo);
    });
    // Triple the photos for infinite scroll effect
    return columns.map(col => [...col, ...col, ...col]);
  };

  const photoColumns = splitPhotosIntoColumns(columnCount);

  const renderColumn = (columnPhotos: PhotoData[], columnIndex: number) => (
    <div key={columnIndex} className="overflow-hidden">
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `scroll-${columnIndex % 2 === 0 ? 'up' : 'down'} 60s linear infinite`,
        }}
      >
        {columnPhotos.map((photo, index) => (
          <div
            key={`col${columnIndex}-${photo.key}-${index}`}
            className="rounded-lg overflow-hidden shadow-sm transition-all duration-300 group relative cursor-pointer border border-transparent hover:border-gray-300"
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
              src={photo.url}
              alt={photo.alt}
              className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-60"
              loading="lazy"
            />
            {/* Hover overlay - gradient only at bottom */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Info positioned bottom-left like Video page */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className={TYPOGRAPHY.cardOverlayTitle}>{photo.title}</h3>
              <p className={TYPOGRAPHY.cardOverlayMeta}>{photo.season}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const intro = language === 'en'
    ? 'Capturing moments of silence, texture, and light. A collection of works exploring the relationship between natural landscapes and human perception.'
    : '捕捉沉默、质感和光的瞬间。探索自然景观与人类感知之间关系的作品集。';

  if (loading) {
    return (
      <div id="photography-root" className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
        </div>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Error state - show message without fake fallback photos
  if (error || photos.length === 0) {
    return (
      <div id="photography-root" className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
        </div>
        <div className="flex flex-col justify-center items-center h-[50vh] text-center">
          <p className="text-gray-500 mb-4">
            {language === 'en' 
              ? error ?? 'No photos available at the moment.' 
              : error ?? '暂时没有可用的照片。'}
          </p>
          <button 
            onClick={() => { window.location.reload(); }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {language === 'en' ? 'Try Again' : '重试'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="photography-root" className="w-full">
      <div id="photography-header" className="mb-12 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          {intro}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[70vh]">
        {photoColumns.map((columnPhotos, index) => renderColumn(columnPhotos, index))}
      </div>
    </div>
  );
};

export default Photography;
