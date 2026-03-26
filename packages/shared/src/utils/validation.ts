import { MAX_DESTINATION_TAG } from "../constants.js";

const XRP_ADDRESS_REGEX = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

/**
 * Validate an XRPL classic address.
 * Checks format only (base58 alphabet, correct prefix and length).
 */
export function isValidXrpAddress(address: string): boolean {
  return XRP_ADDRESS_REGEX.test(address);
}

/**
 * Validate a destination tag (must be an integer in 0..4294967295).
 */
export function isValidDestinationTag(tag: unknown): boolean {
  if (typeof tag !== "number") return false;
  if (!Number.isInteger(tag)) return false;
  return tag >= 0 && tag <= MAX_DESTINATION_TAG;
}

/**
 * Validate a transaction amount string.
 * Must be a positive numeric string (integer or decimal).
 * For XRP amounts (in drops), must be a positive integer.
 */
export function isValidAmount(
  amount: string,
  options: { isDrops?: boolean } = {},
): boolean {
  if (typeof amount !== "string" || amount.length === 0) return false;

  if (options.isDrops) {
    // Drops must be a positive integer string
    if (!/^\d+$/.test(amount)) return false;
    // Must not be zero
    if (/^0+$/.test(amount)) return false;
    return true;
  }

  // General amount: positive decimal
  if (!/^\d+(\.\d+)?$/.test(amount)) return false;
  if (parseFloat(amount) <= 0) return false;
  return true;
}
