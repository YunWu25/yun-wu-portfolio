import React from 'react';
import { PhotoFilters as PhotoFiltersType, SortField } from '../../types';

interface PhotoFiltersProps {
  filters: PhotoFiltersType;
  seasons: string[];
  photoCount: number;
  filteredCount: number;
  onSearchChange: (search: string) => void;
  onSeasonChange: (season: string) => void;
  onSortChange: (field: SortField) => void;
  onRefresh: () => void;
}

export const PhotoFilters: React.FC<PhotoFiltersProps> = ({
  filters,
  seasons,
  photoCount,
  filteredCount,
  onSearchChange,
  onSeasonChange,
  onSortChange,
  onRefresh,
}) => {
  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'uploaded', label: 'Upload Date' },
    { value: 'title', label: 'Title' },
    { value: 'season', label: 'Season' },
    { value: 'size', label: 'File Size' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Left side: Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search photos..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Season filter */}
          <select
            value={filters.season}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">All Seasons</option>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={filters.sortField}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortChange(filters.sortField)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Sort ${filters.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filters.sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Right side: Count and refresh */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {filteredCount === photoCount
              ? `${photoCount} photo${photoCount !== 1 ? 's' : ''}`
              : `${filteredCount} of ${photoCount} photos`}
          </span>
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
