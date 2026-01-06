// Zustand store for platform state management
import { create } from 'zustand';
import { PlatformState, ActivityItem, Metric, QuickAction } from '../types/platform.js';

interface PlatformStore extends PlatformState {
  // Actions
  setCurrentPage: (page: string) => void;
  setSelectedTool: (toolId: string | null) => void;
  setSelectedRecipe: (recipeId: string | null) => void;
  setActiveWorkflows: (workflows: any[]) => void;
  setActiveBaserowRecords: (records: any[]) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Activity
  addActivity: (activity: ActivityItem) => void;
  activities: ActivityItem[];
  
  // Metrics
  metrics: Metric[];
  updateMetric: (id: string, value: number | string, change?: number) => void;
  
  // Quick Actions
  quickActions: QuickAction[];
  setQuickActions: (actions: QuickAction[]) => void;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  // Initial state
  currentPage: 'dashboard',
  selectedTool: null,
  selectedRecipe: null,
  activeWorkflows: [],
  activeBaserowRecords: [],
  sidebarOpen: false,
  activities: [],
  metrics: [],
  quickActions: [],

  // Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedTool: (toolId) => set({ selectedTool: toolId }),
  setSelectedRecipe: (recipeId) => set({ selectedRecipe: recipeId }),
  setActiveWorkflows: (workflows) => set({ activeWorkflows: workflows }),
  setActiveBaserowRecords: (records) => set({ activeBaserowRecords: records }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Activity
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 50), // Keep last 50
    })),

  // Metrics
  updateMetric: (id, value, change) =>
    set((state) => ({
      metrics: state.metrics.map((m) =>
        m.id === id ? { ...m, value, change } : m
      ),
    })),

  // Quick Actions
  setQuickActions: (actions) => set({ quickActions: actions }),
}));

