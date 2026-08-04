export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  PROJECT_FLOW = 'PROJECT_FLOW',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DESIGN = 'DESIGN',
  VIDEO = 'VIDEO',
  TIME = 'TIME',
  GAME = 'GAME',
}

export interface ProjectTask {
  id: string;
  category: 'Design' | 'Development' | 'Content';
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
}

export interface NavItem {
  label: string;
  view: ViewState;
}

// Photo categories with colors
export type PhotoCategory = 'pet' | 'plant' | 'people' | 'landscape' | 'architecture' | 'food' | 'other';

export const PHOTO_CATEGORIES: { value: PhotoCategory; label: string; color: string; bgColor: string }[] = [
  { value: 'pet', label: 'Pet', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'plant', label: 'Plant', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'people', label: 'People', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'landscape', label: 'Landscape', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { value: 'architecture', label: 'Architecture', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'food', label: 'Food', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'other', label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100' },
];

// Admin types
export interface AdminPhoto {
  key: string;
  url: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
  category: PhotoCategory;
  forSale: boolean;
  showInGallery: boolean;
  size: number;
  uploaded: string;
}

export interface PhotoMetadataUpdate {
  key: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
  category: PhotoCategory;
  forSale: boolean;
  showInGallery: boolean;
}

export type SortField = 'uploaded' | 'title' | 'size' | 'season';
export type SortDirection = 'asc' | 'desc';

export interface PhotoFilters {
  search: string;
  season: string;
  sortField: SortField;
  sortDirection: SortDirection;
}
