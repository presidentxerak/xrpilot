export enum TransactionStatus {
  Pending = "pending",
  Submitted = "submitted",
  Validated = "validated",
  Failed = "failed",
  Rejected = "rejected",
}

export interface TransactionRequest {
  /** Source XRPL address */
  readonly source: string;
  /** Destination XRPL address */
  readonly destination: string;
  /** Amount in drops (for XRP) or token value */
  readonly amount: string;
  /** Optional currency code (omit for XRP) */
  readonly currency?: string;
  /** Optional token issuer address */
  readonly issuer?: string;
  /** Optional destination tag (0–4294967295) */
  readonly destinationTag?: number;
  /** Optional memo text */
  readonly memo?: string;
  /** Fee in drops — if omitted, auto-filled by the network */
  readonly fee?: string;
}

export interface TransactionResult {
  /** Transaction hash */
  readonly hash: string;
  /** Ledger index in which the transaction was validated */
  readonly ledgerIndex?: number;
  /** Current status of the transaction */
  readonly status: TransactionStatus;
  /** Engine result code (e.g. "tesSUCCESS") */
  readonly resultCode: string;
  /** Human-readable result message */
  readonly resultMessage: string;
  /** ISO 8601 timestamp of submission */
  readonly submittedAt: string;
  /** Fee actually consumed, in drops */
  readonly fee: string;
}

export interface HumanReadableTransaction {
  /** Short plain-English summary (e.g. "Send 10 XRP to rAbc...xyz") */
  readonly summary: string;
  /** Longer description with full details */
  readonly description: string;
  /** The type of transaction (Payment, TrustSet, OfferCreate, etc.) */
  readonly type: string;
  /** Warnings or notable details for the user */
  readonly warnings: readonly string[];
}
