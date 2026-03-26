import { Wallet } from "xrpl";
import type { WalletSecrets } from "@/lib/wallet/types";

export function generateWallet(): WalletSecrets {
  const wallet = Wallet.generate();

  return {
    address: wallet.classicAddress,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seed: wallet.seed!,
  };
}

export function importFromSeed(seed: string): WalletSecrets {
  const trimmed = seed.trim();

  if (!trimmed) {
    throw new Error("Seed must not be empty");
  }

  let wallet: Wallet;
  try {
    wallet = Wallet.fromSeed(trimmed);
  } catch {
    throw new Error(
      "Invalid seed. Please provide a valid XRPL secret (starts with 's')."
    );
  }

  return {
    address: wallet.classicAddress,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seed: wallet.seed!,
  };
}
