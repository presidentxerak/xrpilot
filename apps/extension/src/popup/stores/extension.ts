import { create } from 'zustand';

interface ExtensionState {
  address: string | null;
  balance: string;
  isLocked: boolean;
  connectedSite: string | null;
  pendingRequest: { type: string; data: unknown; origin: string } | null;
  currentPage: 'home' | 'approve' | 'sign' | 'settings' | 'lock';
  // Actions
  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  lock: () => void;
  unlock: () => void;
  setConnectedSite: (site: string | null) => void;
  setPendingRequest: (request: ExtensionState['pendingRequest']) => void;
  navigate: (page: ExtensionState['currentPage']) => void;
}

export const useExtensionStore = create<ExtensionState>((set) => ({
  address: null,
  balance: '0',
  isLocked: true,
  connectedSite: null,
  pendingRequest: null,
  currentPage: 'lock',
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  lock: () => set({ isLocked: true, currentPage: 'lock' }),
  unlock: () => set({ isLocked: false, currentPage: 'home' }),
  setConnectedSite: (site) => set({ connectedSite: site }),
  setPendingRequest: (request) => set({ pendingRequest: request }),
  navigate: (page) => set({ currentPage: page }),
}));
