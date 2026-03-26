import { create } from 'zustand';

interface WalletState {
  accounts: Array<{ address: string; label: string; isActive: boolean }>;
  activeAddress: string | null;
  balance: string;
  tokens: Array<{ currency: string; balance: string; issuer: string }>;
  isLocked: boolean;
  isAdvancedMode: boolean;
  isOnboarded: boolean;
  // Actions
  setAccounts: (accounts: WalletState['accounts']) => void;
  setActiveAddress: (address: string) => void;
  setBalance: (balance: string) => void;
  setTokens: (tokens: WalletState['tokens']) => void;
  lock: () => void;
  unlock: () => void;
  toggleAdvancedMode: () => void;
  setOnboarded: (value: boolean) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  accounts: [],
  activeAddress: null,
  balance: '0',
  tokens: [],
  isLocked: false,
  isAdvancedMode: false,
  isOnboarded: false,
  setAccounts: (accounts) => set({ accounts }),
  setActiveAddress: (address) => set({ activeAddress: address }),
  setBalance: (balance) => set({ balance }),
  setTokens: (tokens) => set({ tokens }),
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
  toggleAdvancedMode: () => set((s) => ({ isAdvancedMode: !s.isAdvancedMode })),
  setOnboarded: (value) => set({ isOnboarded: value }),
}));
