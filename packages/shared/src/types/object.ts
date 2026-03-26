export type ObjectCategory =
  | "ticket"
  | "coupon"
  | "collectible"
  | "pass"
  | "nft";

export interface DigitalObject {
  /** Unique identifier (NFToken ID or internal UUID) */
  readonly id: string;
  /** Display name of the object */
  readonly name: string;
  /** URL or IPFS CID for the object's image */
  readonly image: string;
  /** Arbitrary key-value metadata */
  readonly metadata: Readonly<Record<string, unknown>>;
  /** Issuer XRPL address */
  readonly issuer: string;
  /** Plain-English description of what this object does or grants */
  readonly utility: string;
  /** Object category */
  readonly category: ObjectCategory;
}

export interface ObjectCollection {
  /** Collection identifier */
  readonly id: string;
  /** Collection name */
  readonly name: string;
  /** Description of the collection */
  readonly description: string;
  /** Issuer XRPL address */
  readonly issuer: string;
  /** Objects belonging to this collection */
  readonly objects: readonly DigitalObject[];
  /** Total number of objects minted in this collection */
  readonly totalMinted: number;
}
