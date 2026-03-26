/**
 * Display utilities for Digital Objects.
 *
 * Every function in this module deals with user-facing presentation.
 * The word "NFT" is never shown to end-users -- Pilot calls them Objects.
 */

import type { ObjectCategory } from "@pilot/shared";
import type { DigitalObject, ObjectIssuer } from "./types.js";

// ---------------------------------------------------------------------------
// Category display
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<ObjectCategory, string> = {
  ticket: "Event Ticket",
  coupon: "Coupon",
  collectible: "Collectible",
  pass: "Access Pass",
  nft: "Digital Collectible",
};

const CATEGORY_ICONS: Record<ObjectCategory, string> = {
  ticket: "ticket",
  coupon: "tag",
  collectible: "sparkles",
  pass: "key",
  nft: "image",
};

/**
 * Map an object category to its user-facing label.
 *
 * The `nft` category is displayed as "Digital Collectible" -- Pilot never
 * exposes the term "NFT" to end-users.
 */
export function getCategoryLabel(category: ObjectCategory): string {
  return CATEGORY_LABELS[category] ?? "Object";
}

/**
 * Return the icon identifier for a category.
 */
export function getCategoryIcon(category: ObjectCategory): string {
  return CATEGORY_ICONS[category] ?? "cube";
}

// ---------------------------------------------------------------------------
// Object display
// ---------------------------------------------------------------------------

/**
 * Return the best display name for an object.
 *
 * Falls back to a generic label derived from the category when no name is
 * set.
 */
export function getObjectDisplayName(obj: DigitalObject): string {
  if (obj.name) return obj.name;
  return getCategoryLabel(obj.category);
}

/**
 * Return the display description / utility text for an object.
 *
 * Prefers the utility string (what the object *does*) over the general
 * description.
 */
export function getObjectDescription(obj: DigitalObject): string {
  return obj.utility || obj.description || "";
}

// ---------------------------------------------------------------------------
// Issuer display
// ---------------------------------------------------------------------------

/**
 * Format issuer information for display, including a verification badge
 * indicator.
 */
export function getIssuerDisplay(issuer: ObjectIssuer): string {
  const badge = issuer.verified ? " \u2713" : "";
  const name = issuer.name || shortenAddress(issuer.address);
  return `${name}${badge}`;
}

// ---------------------------------------------------------------------------
// Shareable output
// ---------------------------------------------------------------------------

/**
 * Create a shareable text representation of a Digital Object.
 *
 * The output is a plain-text block suitable for copy-paste or messaging.
 */
export function formatObjectForShare(obj: DigitalObject): string {
  const lines: string[] = [];
  lines.push(getObjectDisplayName(obj));
  lines.push(`Type: ${getCategoryLabel(obj.category)}`);
  if (obj.utility) {
    lines.push(`Utility: ${obj.utility}`);
  }
  if (obj.description && obj.description !== obj.utility) {
    lines.push(`Description: ${obj.description}`);
  }
  lines.push(`Issued by: ${getIssuerDisplay(obj.issuer)}`);
  if (obj.collection) {
    lines.push(`Collection: ${obj.collection}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
