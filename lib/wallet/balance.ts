import { dropsToXrp as xrplDropsToXrp, xrpToDrops as xrplXrpToDrops } from "xrpl";

const BASE_RESERVE_XRP = 10;
const OWNER_RESERVE_XRP = 2;

/**
 * Converts drops (smallest XRP unit) to a human-readable XRP string.
 * 1 XRP = 1,000,000 drops.
 */
export function dropsToXrp(drops: string | number): string {
  return xrplDropsToXrp(drops) as unknown as string;
}

/**
 * Converts XRP amount to drops.
 */
export function xrpToDrops(xrp: string | number): string {
  return xrplXrpToDrops(xrp);
}

/**
 * Formats a drops amount as a user-friendly XRP string with up to 6 decimal places.
 */
export function formatXrp(drops: string | number): string {
  const xrp = dropsToXrp(drops);
  const num = parseFloat(xrp);

  if (Number.isInteger(num)) {
    return num.toString();
  }

  // Remove trailing zeros but keep meaningful decimals
  return parseFloat(num.toFixed(6)).toString();
}

/**
 * Calculates the available (spendable) balance after accounting for reserves.
 *
 * The XRPL requires a base reserve of 10 XRP plus 2 XRP per owned object
 * (trust lines, offers, escrows, etc.). These reserves cannot be spent.
 *
 * @param balanceInDrops - Total account balance in drops
 * @param ownerCount - Number of objects owned by the account
 * @returns Available balance in drops as a string, or "0" if reserve exceeds balance
 */
export function calculateAvailableBalance(
  balanceInDrops: string | number,
  ownerCount: number
): string {
  const totalXrp = parseFloat(dropsToXrp(balanceInDrops));
  const reserveXrp = BASE_RESERVE_XRP + ownerCount * OWNER_RESERVE_XRP;
  const available = totalXrp - reserveXrp;

  if (available <= 0) {
    return "0";
  }

  return xrpToDrops(available.toString());
}
