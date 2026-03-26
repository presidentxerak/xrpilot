import type { WalletAccount } from "@pilot/shared";
import { generateWallet, importFromSeed } from "./keygen.js";
import { WalletStorage, type StorageAdapter } from "./storage.js";

const ACTIVE_ACCOUNT_KEY = "accounts:active";

/**
 * Multi-account manager — creates, imports, lists, and removes wallet
 * accounts with PIN-protected encrypted storage.
 */
export class AccountManager {
  private readonly storage: WalletStorage;
  private readonly adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
    this.storage = new WalletStorage(adapter);
  }

  /**
   * Create a brand-new XRPL account, encrypt it, and persist it.
   */
  async createAccount(
    label: string,
    pin: string,
  ): Promise<WalletAccount> {
    const keys = generateWallet();

    await this.storage.saveWallet(
      {
        address: keys.address,
        publicKey: keys.publicKey,
        seed: keys.seed,
        label,
      },
      pin,
    );

    const wallets = await this.storage.listWallets();
    return wallets.find((w) => w.address === keys.address)!;
  }

  /**
   * Import an existing wallet from its seed, encrypt it, and persist it.
   */
  async importAccount(
    seed: string,
    label: string,
    pin: string,
  ): Promise<WalletAccount> {
    const keys = importFromSeed(seed);

    await this.storage.saveWallet(
      {
        address: keys.address,
        publicKey: keys.publicKey,
        seed: keys.seed,
        label,
      },
      pin,
    );

    const wallets = await this.storage.listWallets();
    return wallets.find((w) => w.address === keys.address)!;
  }

  /**
   * Retrieve a single account's public metadata by address.
   */
  async getAccount(address: string): Promise<WalletAccount | null> {
    const wallets = await this.storage.listWallets();
    return wallets.find((w) => w.address === address) ?? null;
  }

  /**
   * List every stored account (public metadata only, no secrets).
   */
  async listAccounts(): Promise<WalletAccount[]> {
    return this.storage.listWallets();
  }

  /**
   * Mark the given address as the currently active account.
   */
  async setActiveAccount(address: string): Promise<void> {
    const account = await this.getAccount(address);
    if (account === null) {
      throw new Error(`Account not found: ${address}`);
    }
    await this.adapter.set(ACTIVE_ACCOUNT_KEY, address);
  }

  /**
   * Get the currently active account address, or null if none is set.
   */
  async getActiveAccount(): Promise<string | null> {
    return this.adapter.get(ACTIVE_ACCOUNT_KEY);
  }

  /**
   * Remove an account from storage.  Requires the correct PIN so that
   * callers prove ownership before irreversible deletion.
   */
  async removeAccount(address: string, pin: string): Promise<void> {
    // Verify PIN by attempting to decrypt the wallet
    await this.storage.loadWallet(address, pin);

    await this.storage.removeWallet(address);

    // If the removed account was active, clear the active pointer
    const active = await this.getActiveAccount();
    if (active === address) {
      await this.adapter.remove(ACTIVE_ACCOUNT_KEY);
    }
  }
}
