import { DROPS_PER_XRP } from "../constants.js";

/**
 * Convert drops (string) to XRP decimal string.
 * 1 XRP = 1,000,000 drops.
 */
export function dropsToXrp(drops: string): string {
  const dropsNum = BigInt(drops);
  const whole = dropsNum / BigInt(DROPS_PER_XRP);
  const fraction = dropsNum % BigInt(DROPS_PER_XRP);

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(6, "0").replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
}

/**
 * Convert XRP decimal string to drops string.
 */
export function xrpToDrops(xrp: string): string {
  if (!/^\d+(\.\d{1,6})?$/.test(xrp)) {
    throw new Error(
      `Invalid XRP value "${xrp}": must be a non-negative number with at most 6 decimal places`,
    );
  }

  const [whole, decimal = ""] = xrp.split(".");
  const paddedDecimal = decimal.padEnd(6, "0");
  const drops = BigInt(whole) * BigInt(DROPS_PER_XRP) + BigInt(paddedDecimal);
  return drops.toString();
}

/**
 * Format drops as a human-readable XRP string (e.g. "12.5 XRP").
 */
export function formatXrp(drops: string): string {
  return `${dropsToXrp(drops)} XRP`;
}

/**
 * Truncate an XRPL address for display (e.g. "rAbc...wxyz").
 */
export function formatAddress(
  address: string,
  prefixLen: number = 4,
  suffixLen: number = 4,
): string {
  if (address.length <= prefixLen + suffixLen + 3) {
    return address;
  }
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

/**
 * Format an ISO 8601 date string into a localized human-readable form.
 */
export function formatDate(
  isoDate: string,
  locale: string = "en-US",
): string {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: "${isoDate}"`);
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
