export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  PROJECT_FLOW = 'PROJECT_FLOW',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DESIGN = 'DESIGN',
  VIDEO = 'VIDEO',
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

// Admin types
export interface AdminPhoto {
  key: string;
  url: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
  size: number;
  uploaded: string;
}

export interface PhotoMetadataUpdate {
  key: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
}

export type SortField = 'uploaded' | 'title' | 'size' | 'season';
export type SortDirection = 'asc' | 'desc';

export interface PhotoFilters {
  search: string;
  season: string;
  sortField: SortField;
  sortDirection: SortDirection;
}
