import { encrypt, decrypt } from "@/lib/wallet/encryption";
import type {
  WalletAccount,
  WalletSecrets,
  EncryptedWalletData,
} from "@/lib/wallet/types";

const STORAGE_KEY = "xrpilot_wallets";

function getStoredWallets(): EncryptedWalletData[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as EncryptedWalletData[];
  } catch {
    return [];
  }
}

function persistWallets(wallets: EncryptedWalletData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
}

export async function saveWallet(
  account: WalletSecrets,
  pin: string,
  label?: string
): Promise<WalletAccount> {
  const wallets = getStoredWallets();

  const existing = wallets.find((w) => w.address === account.address);
  if (existing) {
    throw new Error(`Wallet ${account.address} already exists.`);
  }

  const secretPayload = JSON.stringify({
    privateKey: account.privateKey,
    seed: account.seed,
  });
  const encryptedSecret = await encrypt(secretPayload, pin);

  const entry: EncryptedWalletData = {
    address: account.address,
    publicKey: account.publicKey,
    label,
    createdAt: Date.now(),
    encryptedSecret,
  };

  wallets.push(entry);
  persistWallets(wallets);

  return {
    address: entry.address,
    publicKey: entry.publicKey,
    label: entry.label,
    createdAt: entry.createdAt,
  };
}

export function loadWallets(): WalletAccount[] {
  const wallets = getStoredWallets();

  return wallets.map((w) => ({
    address: w.address,
    publicKey: w.publicKey,
    label: w.label,
    createdAt: w.createdAt,
  }));
}

export async function getWalletSecret(
  address: string,
  pin: string
): Promise<{ privateKey: string; seed: string }> {
  const wallets = getStoredWallets();
  const wallet = wallets.find((w) => w.address === address);

  if (!wallet) {
    throw new Error(`Wallet ${address} not found.`);
  }

  const decrypted = await decrypt(wallet.encryptedSecret, pin);

  let secrets: { privateKey: string; seed: string };
  try {
    secrets = JSON.parse(decrypted);
  } catch {
    throw new Error("Failed to parse decrypted wallet data.");
  }

  return secrets;
}

export function removeWallet(address: string): void {
  const wallets = getStoredWallets();
  const filtered = wallets.filter((w) => w.address !== address);

  if (filtered.length === wallets.length) {
    throw new Error(`Wallet ${address} not found.`);
  }

  persistWallets(filtered);
}
