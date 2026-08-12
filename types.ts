export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  PROJECT_FLOW = 'PROJECT_FLOW',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DESIGN = 'DESIGN',
  VIDEO = 'VIDEO',
  TIME = 'TIME',
  GAME = 'GAME',
  EYE_CARE = 'EYE_CARE',
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
export type PhotoCategory = 'animal' | 'plant' | 'flower' | 'people' | 'landscape' | 'architecture' | 'food' | 'yun' | 'sky' | 'lake' | 'client' | 'music' | 'museum' | 'dog' | 'cat' | 'christmas' | 'other';

export const PHOTO_CATEGORIES: { value: PhotoCategory; label: string; color: string; bgColor: string }[] = [
  { value: 'animal', label: 'Other Animal', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'plant', label: 'Plant', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'flower', label: 'Flower', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { value: 'people', label: 'People', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'landscape', label: 'Landscape', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { value: 'architecture', label: 'Architecture', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'food', label: 'Food', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'yun', label: 'Yun', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { value: 'sky', label: 'Sky', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { value: 'lake', label: 'Lake', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { value: 'client', label: 'Client', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { value: 'music', label: 'Music', color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { value: 'museum', label: 'Museum', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'dog', label: 'Dog', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  { value: 'cat', label: 'Cat', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { value: 'christmas', label: 'Christmas', color: 'text-red-600', bgColor: 'bg-red-100' },
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
