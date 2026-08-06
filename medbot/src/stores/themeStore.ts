import { create } from 'zustand';

interface ThemeStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}));
