import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  theme: 'light' | 'dark';
  toasts: Toast[];
  isMobileMenuOpen: boolean;
  onboardingComplete: boolean;
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  toasts: [],
  isMobileMenuOpen: false,
  onboardingComplete: false,
  setTheme: (theme) => set({ theme }),
  addToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: Date.now().toString(36) + Math.random().toString(36).slice(2) },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
}));
