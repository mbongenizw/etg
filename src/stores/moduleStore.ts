import { create } from 'zustand';

export type ModuleType = 
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'service'
  | 'maintenance'
  | 'fuel'
  | 'incidents'
  | 'reminders'
  | 'vehicle-checks'
  | 'reports'
  | 'users'
  | 'roles'
  | 'settings';

interface ModuleState {
  activeModule: ModuleType;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  setActiveModule: (module: ModuleType) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  closeMobileSidebar: () => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
  activeModule: 'dashboard',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  setActiveModule: (module) => set({ activeModule: module, mobileSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
}));
