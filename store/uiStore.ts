import { create } from 'zustand';

interface UIState {
  isAdminSidebarOpen: boolean;
  toggleAdminSidebar: () => void;
  closeAdminSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAdminSidebarOpen: false,
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarOpen: !state.isAdminSidebarOpen })),
  closeAdminSidebar: () => set({ isAdminSidebarOpen: false }),
}));
