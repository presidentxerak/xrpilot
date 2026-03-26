/**
 * XRPL reserves (in drops).
 * As of 2024 the base reserve is 10 XRP and each owned object costs 2 XRP.
 * These are the network defaults; an amendment could change them.
 */
const BASE_RESERVE_DROPS = 10_000_000n; // 10 XRP
const OWNER_RESERVE_DROPS = 2_000_000n; // 2 XRP per owned object
const DROPS_PER_XRP = 1_000_000n;

/**
 * Calculate the spendable balance after accounting for base + owner reserves.
 *
 * @param balanceDrops - Total account balance in drops (string or bigint)
 * @param ownerCount   - Number of objects the account owns on-ledger
 * @returns Available balance in drops as a string. Never negative.
 */
export function calculateAvailableBalance(
  balanceDrops: string | bigint,
  ownerCount: number,
): string {
  const balance = BigInt(balanceDrops);
  const reserve = getReserveAmountBigInt(ownerCount);
  const available = balance - reserve;
  return (available > 0n ? available : 0n).toString();
}

/**
 * Format a drop amount as a human-readable XRP string (e.g. "12.345678 XRP").
 */
export function formatBalanceForDisplay(drops: string | bigint): string {
  const value = BigInt(drops);
  const negative = value < 0n;
  const abs = negative ? -value : value;

  const whole = abs / DROPS_PER_XRP;
  const frac = abs % DROPS_PER_XRP;
  const fracStr = frac.toString().padStart(6, "0");

  const sign = negative ? "-" : "";
  return `${sign}${whole}.${fracStr} XRP`;
}

/**
 * Check whether the account has enough balance to send `amountDrops`
 * while keeping the required reserves intact.
 *
 * @param balanceDrops - Current total balance in drops
 * @param amountDrops  - Amount the user wants to send (excluding fee)
 * @param ownerCount   - Number of owned ledger objects
 */
export function hasMinimumBalance(
  balanceDrops: string | bigint,
  amountDrops: string | bigint,
  ownerCount: number = 0,
): boolean {
  const available = BigInt(
    calculateAvailableBalance(balanceDrops, ownerCount),
  );
  return available >= BigInt(amountDrops);
}

/**
 * Calculate the total reserve (base + owner) for a given owner count.
 *
 * @returns Total reserve in drops as a string.
 */
export function getReserveAmount(ownerCount: number): string {
  return getReserveAmountBigInt(ownerCount).toString();
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function getReserveAmountBigInt(ownerCount: number): bigint {
  return BASE_RESERVE_DROPS + OWNER_RESERVE_DROPS * BigInt(ownerCount);
}
