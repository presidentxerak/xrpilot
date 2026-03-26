/**
 * Digital Object types for Pilot.
 *
 * User-facing language always says "Object" -- never "NFT".
 * The underlying XRPL primitives (NFToken, etc.) are internal details.
 */

// Re-export the canonical category from shared so consumers only need this package
export type { ObjectCategory } from "@pilot/shared";

/** Information about the entity that issued a Digital Object */
export interface ObjectIssuer {
  /** Human-readable issuer name (e.g. "Acme Events") */
  readonly name: string;
  /** XRPL address of the issuer */
  readonly address: string;
  /** Whether the issuer has been verified */
  readonly verified: boolean;
}

/** A user-friendly Digital Object derived from an on-ledger NFToken */
export interface DigitalObject {
  /** Internal unique identifier */
  readonly id: string;
  /** The on-ledger NFToken ID */
  readonly tokenId: string;
  /** Display name */
  readonly name: string;
  /** Human-readable description */
  readonly description: string;
  /** Image URL (resolved, not raw IPFS) */
  readonly image: string;
  /** Category for organisation and display */
  readonly category: import("@pilot/shared").ObjectCategory;
  /** Issuer details */
  readonly issuer: ObjectIssuer;
  /** Plain-English description of what this object does or grants */
  readonly utility: string;
  /** Arbitrary key-value metadata */
  readonly metadata: Readonly<Record<string, string>>;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
  /** Whether the object can be transferred to another account */
  readonly transferable: boolean;
  /** Optional collection this object belongs to */
  readonly collection?: string;
}

/** A grouping of Digital Objects from a single issuer */
export interface ObjectCollection {
  /** Collection identifier */
  readonly id: string;
  /** Collection name */
  readonly name: string;
  /** Objects belonging to this collection */
  readonly objects: readonly DigitalObject[];
  /** Issuer details */
  readonly issuer: ObjectIssuer;
}

/** Possible user interactions with a Digital Object */
export type ObjectInteraction = "view" | "share" | "transfer" | "list" | "trade";

/** Filter criteria for querying objects */
export interface ObjectFilter {
  readonly category?: import("@pilot/shared").ObjectCategory;
  readonly issuer?: string;
  readonly search?: string;
}

/** A listing on the Object Exchange (Advanced Mode only) */
export interface ObjectExchangeListing {
  /** ID of the object being listed */
  readonly objectId: string;
  /** Listing price */
  readonly price: string;
  /** Currency code (e.g. "XRP", "USD") */
  readonly currency: string;
  /** Seller XRPL address */
  readonly seller: string;
  /** ISO-8601 timestamp when the listing was created */
  readonly createdAt: string;
}

/**
 * Minimal representation of a raw XRPL NFToken as returned by account_nfts.
 * Kept here so consumers do not need to depend on the full xrpl package.
 */
export interface XrplNFT {
  readonly NFTokenID: string;
  readonly Issuer: string;
  readonly URI?: string;
  readonly Flags: number;
  readonly NFTokenTaxon: number;
  readonly nft_serial: number;
  readonly TransferFee?: number;
}

/** Decoded metadata typically found at a token URI */
export interface NFTMetadata {
  readonly name?: string;
  readonly description?: string;
  readonly image?: string;
  readonly category?: string;
  readonly utility?: string;
  readonly collection?: string;
  readonly issuer_name?: string;
  readonly [key: string]: unknown;
}

/** A prepared XRPL transaction ready to be signed and submitted */
export interface PreparedTransaction {
  readonly TransactionType: string;
  readonly Account: string;
  readonly [key: string]: unknown;
}

/** A record of a single transfer event */
export interface TransferRecord {
  readonly from: string;
  readonly to: string;
  readonly timestamp: string;
  readonly hash: string;
}
