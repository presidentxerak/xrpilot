import { z } from "zod";

/**
 * XRPL classic addresses are base58-encoded, start with 'r',
 * and are 25–35 characters long.
 */
const xrpAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

/** Hex-encoded public key (66 hex chars for secp256k1, 64 for ed25519 prefixed with ED) */
const publicKeyRegex = /^[0-9A-Fa-f]{64,66}$/;

export const WalletAccountSchema = z.object({
  address: z
    .string()
    .regex(xrpAddressRegex, "Invalid XRPL address format"),
  publicKey: z
    .string()
    .regex(publicKeyRegex, "Invalid public key format"),
  encryptedSecret: z
    .string()
    .min(1, "Encrypted secret must not be empty"),
  label: z
    .string()
    .min(1, "Label must not be empty")
    .max(64, "Label must be at most 64 characters"),
  createdAt: z
    .string()
    .datetime({ message: "createdAt must be a valid ISO 8601 datetime" }),
});

export const AccountBalanceSchema = z.object({
  drops: z
    .string()
    .regex(/^\d+$/, "Drops must be a non-negative integer string"),
  xrp: z
    .string()
    .regex(/^\d+(\.\d{1,6})?$/, "XRP must be a valid decimal string"),
  reservedDrops: z
    .string()
    .regex(/^\d+$/, "Reserved drops must be a non-negative integer string"),
  availableDrops: z
    .string()
    .regex(/^\d+$/, "Available drops must be a non-negative integer string"),
});

export const WalletStateSchema = z.object({
  accounts: z.array(WalletAccountSchema),
  activeAccountIndex: z.number().int().nonnegative().nullable(),
  isInitialized: z.boolean(),
  isUnlocked: z.boolean(),
});

export type WalletAccountInput = z.input<typeof WalletAccountSchema>;
export type AccountBalanceInput = z.input<typeof AccountBalanceSchema>;
export type WalletStateInput = z.input<typeof WalletStateSchema>;
