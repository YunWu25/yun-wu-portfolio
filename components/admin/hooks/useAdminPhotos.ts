import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminPhoto, PhotoMetadataUpdate, PhotoFilters, SortField, SortDirection } from '../../../types';

interface AdminPhotosResponse {
  photos: AdminPhoto[];
}

interface ApiError {
  error: string;
}

interface UseAdminPhotosReturn {
  photos: AdminPhoto[];
  filteredPhotos: AdminPhoto[];
  loading: boolean;
  error: string | null;
  filters: PhotoFilters;
  seasons: string[];
  setFilters: React.Dispatch<React.SetStateAction<PhotoFilters>>;
  updateSearch: (search: string) => void;
  updateSeason: (season: string) => void;
  updateSort: (field: SortField, direction?: SortDirection) => void;
  refreshPhotos: () => Promise<void>;
  savePhoto: (data: PhotoMetadataUpdate) => Promise<void>;
}

const defaultFilters: PhotoFilters = {
  search: '',
  season: '',
  sortField: 'uploaded',
  sortDirection: 'desc',
};

export function useAdminPhotos(): UseAdminPhotosReturn {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PhotoFilters>(defaultFilters);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/photos');
      if (!res.ok) throw new Error('Failed to fetch photos');
      const data: AdminPhotosResponse = await res.json();
      setPhotos(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  // Extract unique seasons for filter dropdown
  const seasons = useMemo(() => {
    const uniqueSeasons = new Set(photos.map(p => p.season).filter(Boolean));
    return Array.from(uniqueSeasons).sort();
  }, [photos]);

  // Apply filters and sorting
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    // Search filter (searches in title, alt, artist, key)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.alt.toLowerCase().includes(searchLower) ||
        p.artist.toLowerCase().includes(searchLower) ||
        p.key.toLowerCase().includes(searchLower)
      );
    }

    // Season filter
    if (filters.season) {
      result = result.filter(p => p.season === filters.season);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortField) {
        case 'uploaded':
          comparison = new Date(a.uploaded).getTime() - new Date(b.uploaded).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'season':
          comparison = a.season.localeCompare(b.season);
          break;
      }
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [photos, filters]);

  const updateSearch = useCallback((search: string) => {
    setFilters(f => ({ ...f, search }));
  }, []);

  const updateSeason = useCallback((season: string) => {
    setFilters(f => ({ ...f, season }));
  }, []);

  const updateSort = useCallback((field: SortField, direction?: SortDirection) => {
    setFilters(f => ({
      ...f,
      sortField: field,
      sortDirection: direction ?? (f.sortField === field && f.sortDirection === 'asc' ? 'desc' : 'asc'),
    }));
  }, []);

  const savePhoto = useCallback(async (data: PhotoMetadataUpdate) => {
    const res = await fetch('/api/admin/photos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err: ApiError = await res.json();
      throw new Error(err.error || 'Failed to save');
    }

    // Update local state optimistically
    setPhotos(prev =>
      prev.map(p =>
        p.key === data.key
          ? { ...p, title: data.title, alt: data.alt, artist: data.artist, season: data.season }
          : p
      )
    );
  }, []);

  return {
    photos,
    filteredPhotos,
    loading,
    error,
    filters,
    seasons,
    setFilters,
    updateSearch,
    updateSeason,
    updateSort,
    refreshPhotos: fetchPhotos,
    savePhoto,
  };
}
