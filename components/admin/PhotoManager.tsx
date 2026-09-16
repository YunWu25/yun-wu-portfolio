import React, { useEffect } from 'react';
import { useAdminPhotos } from './hooks/useAdminPhotos';
import { PhotoFilters } from './PhotoFilters';
import { PhotoCard } from './PhotoCard';

export const PhotoManager: React.FC = () => {
  // Override body overflow:hidden from index.html for admin page
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  const {
    photos,
    filteredPhotos,
    loading,
    error,
    filters,
    seasons,
    updateSearch,
    updateSeason,
    updateSort,
    refreshPhotos,
    savePhoto,
  } = useAdminPhotos();

  return (
    <div className="h-screen bg-gray-50 dark:bg-dark-bg overflow-y-auto">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-text flex items-center gap-2">
              <span className="text-xl">📷</span>
              Photo Metadata Admin
            </h1>
            <div className="flex items-center gap-4">
              <a
                href="/admin/chat-logs"
                className="text-sm text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text transition-colors"
              >
                Chat Logs
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text transition-colors"
              >
                ← Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <PhotoFilters
          filters={filters}
          seasons={seasons}
          photoCount={photos.length}
          filteredCount={filteredPhotos.length}
          onSearchChange={updateSearch}
          onSeasonChange={updateSeason}
          onSortChange={updateSort}
          onRefresh={() => {
            void refreshPhotos();
          }}
        />

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16 text-gray-500 dark:text-dark-muted">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-300 dark:border-dark-border border-t-gray-600 dark:border-t-dark-muted rounded-full mb-4" />
            <p>Loading photos...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-lg p-4 text-center">
            <p className="font-medium">Failed to load photos</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => {
                void refreshPhotos();
              }}
              className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg text-sm transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-dark-muted">
            {photos.length === 0 ? (
              <>
                <p className="text-lg">No photos found in R2 bucket</p>
                <p className="text-sm mt-2">Upload images to public/images/ to get started</p>
              </>
            ) : (
              <>
                <p className="text-lg">No photos match your filters</p>
                <button
                  onClick={() => {
                    updateSearch('');
                    updateSeason('');
                  }}
                  className="mt-3 px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg text-sm transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

        {/* Photo grid */}
        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="space-y-4">
            {filteredPhotos.map((photo) => (
              <PhotoCard key={photo.key} photo={photo} onSave={savePhoto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
