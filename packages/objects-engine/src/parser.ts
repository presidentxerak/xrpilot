/**
 * Parse raw XRPL NFTokens into user-friendly Digital Objects.
 *
 * All technical XRPL details are abstracted away -- callers receive
 * DigitalObjects ready for display in the Pilot UI.
 */

import type { ObjectCategory } from "@pilot/shared";
import type { DigitalObject, NFTMetadata, XrplNFT } from "./types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
const IPFS_PROTOCOL = "ipfs://";
const HEX_REGEX = /^[0-9a-fA-F]+$/;

/** NFToken flag: the token is transferable */
const LSB_TRANSFERABLE = 0x0008;

// ---------------------------------------------------------------------------
// URI helpers
// ---------------------------------------------------------------------------

/**
 * Decode a hex-encoded URI to a UTF-8 string.
 */
function decodeHexUri(hex: string): string {
  if (!HEX_REGEX.test(hex)) {
    return hex;
  }

  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/**
 * Convert an IPFS URI to an HTTP gateway URL.
 * If the value is already an HTTP(S) URL it is returned unchanged.
 */
export function resolveIpfsUri(uri: string): string {
  if (uri.startsWith(IPFS_PROTOCOL)) {
    return `${IPFS_GATEWAY}${uri.slice(IPFS_PROTOCOL.length)}`;
  }
  if (uri.startsWith("Qm") || uri.startsWith("bafy")) {
    return `${IPFS_GATEWAY}${uri}`;
  }
  return uri;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/**
 * Fetch and parse metadata from a token URI.
 *
 * Supports both IPFS and HTTP(S) URIs. Returns an empty object when the
 * metadata cannot be fetched or parsed.
 */
export async function parseMetadata(uri: string): Promise<NFTMetadata> {
  try {
    const resolved = resolveIpfsUri(uri);
    const response = await fetch(resolved);
    if (!response.ok) {
      return {};
    }
    const json = (await response.json()) as NFTMetadata;
    return json;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

/** Keywords that signal each category */
const CATEGORY_KEYWORDS: Record<ObjectCategory, readonly string[]> = {
  ticket: ["ticket", "event", "admission", "entry", "seat"],
  coupon: ["coupon", "discount", "voucher", "promo", "offer", "redeem"],
  pass: ["pass", "membership", "access", "subscription", "vip"],
  collectible: ["collectible", "art", "rare", "limited", "edition"],
  nft: [],
};

/**
 * Auto-detect the category of an object from its metadata.
 *
 * The function inspects the explicit `category` field first, then falls back
 * to keyword matching against name, description and utility fields.
 * The default is `"collectible"`.
 */
export function detectCategory(metadata: NFTMetadata): ObjectCategory {
  // 1. Explicit category field
  if (metadata.category) {
    const explicit = metadata.category.toLowerCase().trim();
    const validCategories: ObjectCategory[] = [
      "ticket",
      "coupon",
      "collectible",
      "pass",
      "nft",
    ];
    if (validCategories.includes(explicit as ObjectCategory)) {
      return explicit as ObjectCategory;
    }
  }

  // 2. Keyword matching
  const haystack = [
    metadata.name ?? "",
    metadata.description ?? "",
    metadata.utility ?? "",
  ]
    .join(" ")
    .toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    ObjectCategory,
    readonly string[],
  ][]) {
    if (keywords.length === 0) continue;
    if (keywords.some((kw) => haystack.includes(kw))) {
      return category;
    }
  }

  // 3. Default
  return "collectible";
}

// ---------------------------------------------------------------------------
// Image extraction
// ---------------------------------------------------------------------------

/**
 * Extract and resolve the image URL from metadata.
 * Handles IPFS gateway conversion automatically.
 */
export function getObjectImage(metadata: NFTMetadata): string {
  const raw = metadata.image ?? "";
  if (!raw) return "";
  return resolveIpfsUri(raw);
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

/**
 * Convert a raw XRPL NFToken into a user-friendly `DigitalObject`.
 *
 * This is the primary entry-point of the parser module. It decodes the
 * on-ledger token, fetches its metadata URI, and returns a fully-populated
 * DigitalObject ready for the Pilot UI.
 *
 * If you already have the metadata, pass it as the second argument to skip
 * the network fetch.
 */
export async function parseNFToken(
  nft: XrplNFT,
  prefetchedMetadata?: NFTMetadata,
): Promise<DigitalObject> {
  const uri = nft.URI ? decodeHexUri(nft.URI) : "";
  const metadata = prefetchedMetadata ?? (uri ? await parseMetadata(uri) : {});

  const category = detectCategory(metadata);
  const image = getObjectImage(metadata);
  const transferable = (nft.Flags & LSB_TRANSFERABLE) !== 0;

  // Build a flat string-only metadata record for the DigitalObject
  const flatMeta: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      flatMeta[key] = value;
    } else if (value !== undefined && value !== null) {
      flatMeta[key] = String(value);
    }
  }

  return {
    id: nft.NFTokenID,
    tokenId: nft.NFTokenID,
    name: metadata.name ?? `Object #${nft.nft_serial}`,
    description: metadata.description ?? "",
    image,
    category,
    issuer: {
      name: metadata.issuer_name ?? "",
      address: nft.Issuer,
      verified: false,
    },
    utility: metadata.utility ?? "",
    metadata: flatMeta,
    createdAt: new Date().toISOString(),
    transferable,
    collection: metadata.collection,
  };
}
