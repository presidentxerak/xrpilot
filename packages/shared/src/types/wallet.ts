export interface WalletAccount {
  /** Classic XRPL address (starts with 'r') */
  readonly address: string;
  /** Hex-encoded public key */
  readonly publicKey: string;
  /** Encrypted secret/seed — never stored in plaintext */
  readonly encryptedSecret: string;
  /** User-defined label for the account */
  label: string;
  /** ISO 8601 timestamp of account creation */
  readonly createdAt: string;
}

export interface AccountBalance {
  /** XRP balance in drops (1 XRP = 1,000,000 drops) */
  readonly drops: string;
  /** XRP balance as a human-readable decimal string */
  readonly xrp: string;
  /** Amount reserved by the network (base + owner reserves) */
  readonly reservedDrops: string;
  /** Available (spendable) balance in drops */
  readonly availableDrops: string;
}

export interface WalletState {
  /** All accounts managed by the wallet */
  readonly accounts: readonly WalletAccount[];
  /** Index of the currently active account, or null if none */
  activeAccountIndex: number | null;
  /** Whether the wallet has been initialized with a password */
  readonly isInitialized: boolean;
  /** Whether the wallet is currently unlocked */
  isUnlocked: boolean;
}
