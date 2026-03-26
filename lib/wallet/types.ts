export interface WalletAccount {
  address: string;
  publicKey: string;
  label?: string;
  createdAt: number;
}

export interface WalletSecrets {
  address: string;
  publicKey: string;
  privateKey: string;
  seed: string;
}

export interface EncryptedWalletData {
  address: string;
  publicKey: string;
  label?: string;
  createdAt: number;
  encryptedSecret: string;
}

export interface TransactionRecord {
  hash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  timestamp: number;
  sequence: number;
  status: "success" | "failed";
  memo?: string;
}

export type ObjectCategory =
  | "art"
  | "collectible"
  | "domain"
  | "ticket"
  | "credential"
  | "other";

export interface DigitalObject {
  tokenId: string;
  issuer: string;
  owner: string;
  uri?: string;
  category: ObjectCategory;
  name?: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AccountInfo {
  address: string;
  balance: string;
  ownerCount: number;
  sequence: number;
}

export interface SendXrpParams {
  fromSeed: string;
  to: string;
  amountInDrops: string;
  memo?: string;
  destinationTag?: number;
}

export interface SendXrpResult {
  hash: string;
  status: "success" | "failed";
  resultCode: string;
  fee: string;
}
