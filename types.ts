export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  PROJECT_FLOW = 'PROJECT_FLOW',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DESIGN = 'DESIGN',
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