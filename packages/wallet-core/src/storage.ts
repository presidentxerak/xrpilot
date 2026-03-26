import type { WalletAccount } from "@pilot/shared";
import { encrypt, decrypt } from "./encryption.js";

// ---------------------------------------------------------------------------
// Storage adapter interface + built-in adapters
// ---------------------------------------------------------------------------

export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * In-memory adapter — useful for tests and ephemeral sessions.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Browser `localStorage`-backed adapter.
 */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly prefix: string = "pilot:") {}

  async get(key: string): Promise<string | null> {
    return globalThis.localStorage.getItem(this.prefix + key);
  }

  async set(key: string, value: string): Promise<void> {
    globalThis.localStorage.setItem(this.prefix + key, value);
  }

  async remove(key: string): Promise<void> {
    globalThis.localStorage.removeItem(this.prefix + key);
  }
}

// ---------------------------------------------------------------------------
// Wallet storage keys
// ---------------------------------------------------------------------------

const WALLET_LIST_KEY = "wallets:list";
const walletKey = (address: string) => `wallets:${address}`;

// ---------------------------------------------------------------------------
// Persisted wallet record (public metadata + encrypted secret)
// ---------------------------------------------------------------------------

interface StoredWallet {
  readonly address: string;
  readonly publicKey: string;
  readonly encryptedSecret: string;
  readonly label: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// WalletStorage — high-level encrypted persistence
// ---------------------------------------------------------------------------

export class WalletStorage {
  constructor(private readonly adapter: StorageAdapter) {}

  /**
   * Persist a wallet. The seed/secret is encrypted with the user's PIN before
   * it touches the storage adapter.
   */
  async saveWallet(
    wallet: {
      address: string;
      publicKey: string;
      seed: string;
      label: string;
    },
    pin: string,
  ): Promise<void> {
    const encryptedSecret = await encrypt(wallet.seed, pin);

    const stored: StoredWallet = {
      address: wallet.address,
      publicKey: wallet.publicKey,
      encryptedSecret,
      label: wallet.label,
      createdAt: new Date().toISOString(),
    };

    await this.adapter.set(walletKey(wallet.address), JSON.stringify(stored));

    // Update the address list
    const addresses = await this.getAddressList();
    if (!addresses.includes(wallet.address)) {
      addresses.push(wallet.address);
      await this.adapter.set(WALLET_LIST_KEY, JSON.stringify(addresses));
    }
  }

  /**
   * Load a wallet's public metadata and decrypt its secret with the given PIN.
   */
  async loadWallet(
    address: string,
    pin: string,
  ): Promise<WalletAccount & { seed: string }> {
    const raw = await this.adapter.get(walletKey(address));
    if (raw === null) {
      throw new Error(`Wallet not found: ${address}`);
    }

    const stored: StoredWallet = JSON.parse(raw);
    const seed = await decrypt(stored.encryptedSecret, pin);

    return {
      address: stored.address,
      publicKey: stored.publicKey,
      encryptedSecret: stored.encryptedSecret,
      label: stored.label,
      createdAt: stored.createdAt,
      seed,
    };
  }

  /**
   * List all stored wallets (public metadata only — no secrets).
   */
  async listWallets(): Promise<WalletAccount[]> {
    const addresses = await this.getAddressList();
    const wallets: WalletAccount[] = [];

    for (const address of addresses) {
      const raw = await this.adapter.get(walletKey(address));
      if (raw !== null) {
        const stored: StoredWallet = JSON.parse(raw);
        wallets.push({
          address: stored.address,
          publicKey: stored.publicKey,
          encryptedSecret: stored.encryptedSecret,
          label: stored.label,
          createdAt: stored.createdAt,
        });
      }
    }

    return wallets;
  }

  /**
   * Remove a wallet from storage.
   */
  async removeWallet(address: string): Promise<void> {
    await this.adapter.remove(walletKey(address));

    const addresses = await this.getAddressList();
    const updated = addresses.filter((a) => a !== address);
    await this.adapter.set(WALLET_LIST_KEY, JSON.stringify(updated));
  }

  /**
   * Export a wallet's decrypted seed (requires correct PIN).
   */
  async exportWallet(address: string, pin: string): Promise<string> {
    const wallet = await this.loadWallet(address, pin);
    return wallet.seed;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private async getAddressList(): Promise<string[]> {
    const raw = await this.adapter.get(WALLET_LIST_KEY);
    if (raw === null) return [];
    return JSON.parse(raw) as string[];
  }
}
