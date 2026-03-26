import { Wallet } from "xrpl";

export interface WalletKeys {
  readonly address: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly seed: string;
}

/**
 * Generate a brand-new XRPL wallet with a random seed.
 */
export function generateWallet(): WalletKeys {
  const wallet = Wallet.generate();
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seed: wallet.seed!,
  };
}

/**
 * Import an existing XRPL wallet from a secret/seed string.
 */
export function importFromSeed(seed: string): WalletKeys {
  const wallet = Wallet.fromSeed(seed);
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seed,
  };
}

/**
 * Import an XRPL wallet from raw entropy (hex string).
 */
export function importFromEntropy(entropy: string): WalletKeys {
  const wallet = Wallet.fromEntropy(entropy);
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seed: wallet.seed!,
  };
}

/**
 * Derive a classic XRPL address from a hex-encoded public key.
 */
export function deriveAddress(publicKey: string): string {
  const keypair = { publicKey, privateKey: "0".repeat(66) };
  // Wallet constructor accepts a publicKey and derives the address
  const wallet = new Wallet(keypair.publicKey, keypair.privateKey);
  return wallet.address;
}
