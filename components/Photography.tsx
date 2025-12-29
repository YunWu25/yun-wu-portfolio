import React, { useEffect, useState, useCallback } from 'react';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

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

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedPhotoIndex === null) return;
    
    if (e.key === 'Escape') {
      setSelectedPhotoIndex(null);
    } else if (e.key === 'ArrowRight') {
      setSelectedPhotoIndex((prev) => 
        prev !== null ? (prev + 1) % photos.length : null
      );
    } else if (e.key === 'ArrowLeft') {
      setSelectedPhotoIndex((prev) => 
        prev !== null ? (prev - 1 + photos.length) % photos.length : null
      );
    }
  }, [selectedPhotoIndex, photos.length]);

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPhotoIndex, handleKeyDown]);

  const openLightbox = (photoKey: string) => {
    const index = photos.findIndex(p => p.key === photoKey);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
    }
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const goToNext = () => {
    setSelectedPhotoIndex((prev) => 
      prev !== null ? (prev + 1) % photos.length : null
    );
  };

  const goToPrev = () => {
    setSelectedPhotoIndex((prev) => 
      prev !== null ? (prev - 1 + photos.length) % photos.length : null
    );
  };

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
            onClick={() => { openLightbox(photo.key); }}
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
              className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-90"
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

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

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

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight size={40} />
          </button>

          {/* Image container */}
          <div 
            className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {/* Photo info */}
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-medium">{selectedPhoto.title}</h3>
              <p className="text-white/70 text-sm mt-1">
                {selectedPhoto.artist} · {selectedPhoto.season}
              </p>
            </div>
          </div>

          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 0} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Photography;
