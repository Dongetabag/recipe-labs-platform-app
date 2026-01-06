// Platform-wide types

export interface PlatformState {
  currentPage: string;
  selectedTool: string | null;
  selectedRecipe: string | null;
  activeWorkflows: any[];
  activeBaserowRecords: any[];
  sidebarOpen: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'workflow' | 'data' | 'agent' | 'tool';
  action: string;
  user: string;
  timestamp: string;
  details?: any;
}

export interface Metric {
  id: string;
  name: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  category?: string;
}


