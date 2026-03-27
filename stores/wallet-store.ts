import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WalletAccount } from "@/lib/wallet/types";
import { generateWallet, importFromSeed } from "@/lib/wallet/keygen";
import { saveWallet, loadWallets, removeWallet } from "@/lib/wallet/storage";
import type { XrplNetwork } from "@/lib/wallet/connection";
import { setNetwork } from "@/lib/wallet/connection";

interface WalletState {
  accounts: WalletAccount[];
  activeAddress: string | null;
  balance: string | null;
  tokens: string[];
  isLocked: boolean;
  isAdvancedMode: boolean;
  isOnboarded: boolean;
  network: XrplNetwork;
  isActivated: boolean;
}

interface WalletActions {
  createWallet: (pin: string, label?: string) => Promise<WalletAccount>;
  importWallet: (
    seed: string,
    pin: string,
    label?: string
  ) => Promise<WalletAccount>;
  setActiveAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setTokens: (tokens: string[]) => void;
  lock: () => void;
  unlock: (pin: string) => void;
  removeAccount: (address: string) => void;
  toggleAdvancedMode: () => void;
  setOnboarded: () => void;
  refreshAccounts: () => void;
  switchNetwork: (network: XrplNetwork) => Promise<void>;
  setActivated: (activated: boolean) => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // State
      accounts: [],
      activeAddress: null,
      balance: null,
      tokens: [],
      isLocked: true,
      isAdvancedMode: false,
      isOnboarded: false,
      network: "testnet",
      isActivated: false,

      // Actions
      createWallet: async (pin, label) => {
        const secrets = generateWallet();
        const account = await saveWallet(secrets, pin, label);

        set((state) => ({
          accounts: [...state.accounts, account],
          activeAddress: state.activeAddress ?? account.address,
        }));

        return account;
      },

      importWallet: async (seed, pin, label) => {
        const secrets = importFromSeed(seed);
        const account = await saveWallet(secrets, pin, label);

        set((state) => ({
          accounts: [...state.accounts, account],
          activeAddress: state.activeAddress ?? account.address,
        }));

        return account;
      },

      setActiveAddress: (address) => {
        set({ activeAddress: address, balance: null, tokens: [] });
      },

      setBalance: (balance) => {
        set({ balance });
      },

      setTokens: (tokens) => {
        set({ tokens });
      },

      lock: () => {
        set({ isLocked: true });
      },

      unlock: (_pin: string) => {
        set({ isLocked: false });
      },

      removeAccount: (address) => {
        removeWallet(address);
        const { accounts, activeAddress } = get();
        const updated = accounts.filter((a) => a.address !== address);
        const newActive =
          activeAddress === address
            ? updated[0]?.address ?? null
            : activeAddress;

        set({ accounts: updated, activeAddress: newActive });
      },

      toggleAdvancedMode: () => {
        set((state) => ({ isAdvancedMode: !state.isAdvancedMode }));
      },

      setOnboarded: () => {
        set({ isOnboarded: true });
      },

      refreshAccounts: () => {
        const accounts = loadWallets();
        set({ accounts });
      },

      switchNetwork: async (network) => {
        await setNetwork(network);
        set({ network, balance: null, isActivated: false });
      },

      setActivated: (activated) => {
        set({ isActivated: activated });
      },
    }),
    {
      name: "xrpilot_wallet_store",
      partialize: (state) => ({
        activeAddress: state.activeAddress,
        isAdvancedMode: state.isAdvancedMode,
        isOnboarded: state.isOnboarded,
        isLocked: state.isLocked,
        network: state.network,
        isActivated: state.isActivated,
      }),
    }
  )
);
