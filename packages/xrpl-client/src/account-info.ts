import {
  type Client,
  type AccountInfoResponse,
  type AccountTxResponse,
  type AccountLinesResponse,
  type AccountObjectsResponse,
  dropsToXrp,
} from "xrpl";
import type { AccountBalance, Token, TrustLine } from "@pilot/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccountInfo {
  /** Classic XRPL address */
  readonly address: string;
  /** Balance breakdown */
  readonly balance: AccountBalance;
  /** Current account sequence number */
  readonly sequence: number;
  /** Number of objects owned (affects reserve) */
  readonly ownerCount: number;
}

export interface PaginatedTransactionsOptions {
  /** Maximum number of transactions to return */
  readonly limit?: number;
  /** Opaque marker for pagination (returned from a previous call) */
  readonly marker?: unknown;
  /** Only return transactions from this ledger index onward */
  readonly ledgerIndexMin?: number;
  /** Only return transactions up to this ledger index */
  readonly ledgerIndexMax?: number;
  /** When true, include the full transaction metadata */
  readonly includeMetadata?: boolean;
}

export interface PaginatedTransactions {
  /** Array of transaction results */
  readonly transactions: readonly AccountTxResponse["result"]["transactions"];
  /** Pagination marker — pass to the next call to continue */
  readonly marker: unknown | undefined;
}

// ---------------------------------------------------------------------------
// Reserve calculation
// ---------------------------------------------------------------------------

const BASE_RESERVE_DROPS = 10_000_000; // 10 XRP
const OWNER_RESERVE_DROPS = 2_000_000; // 2 XRP per owned object

function calculateReserve(ownerCount: number): string {
  return String(BASE_RESERVE_DROPS + ownerCount * OWNER_RESERVE_DROPS);
}

function calculateAvailable(balanceDrops: string, ownerCount: number): string {
  const balance = BigInt(balanceDrops);
  const reserve = BigInt(calculateReserve(ownerCount));
  const available = balance - reserve;
  return available > 0n ? available.toString() : "0";
}

// ---------------------------------------------------------------------------
// Account queries
// ---------------------------------------------------------------------------

/**
 * Fetch core account information: balance, sequence, and owner count.
 */
export async function getAccountInfo(
  client: Client,
  address: string,
): Promise<AccountInfo> {
  const response: AccountInfoResponse = await client.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });

  const data = response.result.account_data;
  const balanceDrops = data.Balance;
  const ownerCount = data.OwnerCount;

  const reservedDrops = calculateReserve(ownerCount);
  const availableDrops = calculateAvailable(balanceDrops, ownerCount);

  return {
    address,
    balance: {
      drops: balanceDrops,
      xrp: dropsToXrp(balanceDrops),
      reservedDrops,
      availableDrops,
    },
    sequence: data.Sequence,
    ownerCount,
  };
}

/**
 * Retrieve paginated transaction history for an account.
 */
export async function getAccountTransactions(
  client: Client,
  address: string,
  options: PaginatedTransactionsOptions = {},
): Promise<PaginatedTransactions> {
  const response: AccountTxResponse = await client.request({
    command: "account_tx",
    account: address,
    limit: options.limit ?? 20,
    marker: options.marker as undefined,
    ledger_index_min: options.ledgerIndexMin ?? -1,
    ledger_index_max: options.ledgerIndexMax ?? -1,
    forward: false,
  });

  return {
    transactions: response.result.transactions,
    marker: response.result.marker,
  };
}

/**
 * Get all trust lines (token balances) for an account.
 */
export async function getAccountTokens(
  client: Client,
  address: string,
): Promise<readonly Token[]> {
  const lines = await getAllTrustLines(client, address);

  return lines.map((line) => ({
    currency: line.currency,
    issuer: line.account,
    balance: line.balance,
    name: line.currency, // display name defaults to currency code
    verified: false,
  }));
}

/**
 * Get all objects (NFTs, offers, etc.) owned by an account.
 */
export async function getAccountObjects(
  client: Client,
  address: string,
): Promise<AccountObjectsResponse["result"]["account_objects"]> {
  const objects: AccountObjectsResponse["result"]["account_objects"] = [];
  let marker: unknown = undefined;

  do {
    const response: AccountObjectsResponse = await client.request({
      command: "account_objects",
      account: address,
      ledger_index: "validated",
      marker: marker as undefined,
    });

    objects.push(...response.result.account_objects);
    marker = response.result.marker;
  } while (marker !== undefined);

  return objects;
}

/**
 * Check whether an account is activated on the XRP Ledger.
 * An account is activated once it receives the minimum reserve (currently 10 XRP).
 */
export async function isAccountActivated(
  client: Client,
  address: string,
): Promise<boolean> {
  try {
    await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    return true;
  } catch (error: unknown) {
    const err = error as { data?: { error?: string } };
    if (err.data?.error === "actNotFound") {
      return false;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface RawTrustLine {
  account: string;
  balance: string;
  currency: string;
  limit: string;
  limit_peer: string;
  no_ripple: boolean;
  no_ripple_peer: boolean;
  peer_authorized: boolean;
  freeze: boolean;
  freeze_peer: boolean;
}

async function getAllTrustLines(
  client: Client,
  address: string,
): Promise<RawTrustLine[]> {
  const lines: RawTrustLine[] = [];
  let marker: unknown = undefined;

  do {
    const response: AccountLinesResponse = await client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated",
      marker: marker as undefined,
    });

    lines.push(
      ...(response.result.lines as unknown as RawTrustLine[]),
    );
    marker = response.result.marker;
  } while (marker !== undefined);

  return lines;
}

/**
 * Convert raw trust line data to the shared TrustLine type.
 */
export function toTrustLine(raw: RawTrustLine): TrustLine {
  return {
    currency: raw.currency,
    issuer: raw.account,
    limit: raw.limit,
    balance: raw.balance,
    peerAuthorized: raw.peer_authorized,
    frozen: raw.freeze,
    noRipple: raw.no_ripple,
  };
}
