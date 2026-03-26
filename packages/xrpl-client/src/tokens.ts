import {
  type Client,
  type TrustSet,
  type AccountLinesResponse,
} from "xrpl";
import type { TrustLine } from "@pilot/shared";
import type { HumanReadableTransaction } from "@pilot/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrustLineParams {
  /** The account that is setting the trust line */
  readonly account: string;
  /** Currency code (3-char ISO or 40-char hex) */
  readonly currency: string;
  /** Issuer's XRPL address */
  readonly issuer: string;
  /** Maximum amount to trust the issuer for (as a decimal string) */
  readonly limit: string;
}

export interface TokenInfo {
  /** Currency code */
  readonly currency: string;
  /** Issuer address */
  readonly issuer: string;
  /** Number of trust lines (holders) if available */
  readonly trustLineCount?: number;
  /** Total supply if known */
  readonly totalSupply?: string;
  /** Human-friendly display name */
  readonly displayName: string;
}

// ---------------------------------------------------------------------------
// Trust line operations
// ---------------------------------------------------------------------------

/**
 * Build a TrustSet transaction to allow a token in the user's wallet.
 *
 * Plain-English description: "Allow this token in your wallet"
 */
export function createTrustLine(params: TrustLineParams): TrustSet {
  return {
    TransactionType: "TrustSet",
    Account: params.account,
    LimitAmount: {
      currency: params.currency,
      issuer: params.issuer,
      value: params.limit,
    },
  };
}

/**
 * Build a TrustSet transaction that removes a trust line by setting the
 * limit to zero.
 *
 * Plain-English description: "Remove this token from your wallet"
 *
 * Note: The trust line can only be removed when the balance is zero.
 */
export function removeTrustLine(
  params: Omit<TrustLineParams, "limit">,
): TrustSet {
  return {
    TransactionType: "TrustSet",
    Account: params.account,
    LimitAmount: {
      currency: params.currency,
      issuer: params.issuer,
      value: "0",
    },
  };
}

/**
 * Fetch metadata about a token by querying trust lines from the issuer.
 */
export async function getTokenInfo(
  client: Client,
  currency: string,
  issuer: string,
): Promise<TokenInfo> {
  let trustLineCount = 0;
  let marker: unknown = undefined;

  // We page through at most a few batches to get an approximate count.
  const maxPages = 5;
  let pages = 0;

  do {
    const response: AccountLinesResponse = await client.request({
      command: "account_lines",
      account: issuer,
      peer: undefined,
      ledger_index: "validated",
      marker: marker as undefined,
      limit: 400,
    });

    const matching = response.result.lines.filter(
      (line) => line.currency === currency,
    );
    trustLineCount += matching.length;
    marker = response.result.marker;
    pages++;
  } while (marker !== undefined && pages < maxPages);

  return {
    currency,
    issuer,
    trustLineCount,
    displayName: formatCurrencyName(currency),
  };
}

// ---------------------------------------------------------------------------
// Human-readable helpers
// ---------------------------------------------------------------------------

/**
 * Describe a trust line operation in friendly language.
 */
export function describeTrustLineAction(
  params: TrustLineParams,
): HumanReadableTransaction {
  const name = formatCurrencyName(params.currency);
  const isRemoval = params.limit === "0";

  if (isRemoval) {
    return {
      summary: `Remove ${name} from your wallet`,
      description: `You are removing ${name} (issuer: ${params.issuer}) from your wallet. Your balance of this token must be zero before it can be removed.`,
      type: "TrustSet",
      warnings: [],
    };
  }

  return {
    summary: `Allow ${name} in your wallet`,
    description: `You are adding ${name} (issuer: ${params.issuer}) to your wallet with a maximum limit of ${params.limit}. This lets you receive and hold this token.`,
    type: "TrustSet",
    warnings: [],
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Convert a hex-encoded currency code to its readable form, or return
 * the code unchanged if it is already a 3-char standard code.
 */
function formatCurrencyName(currency: string): string {
  if (currency.length === 3) {
    return currency;
  }

  // 40-char hex — try to decode to ASCII, stripping null bytes
  if (currency.length === 40) {
    try {
      const decoded = Buffer.from(currency, "hex")
        .toString("utf8")
        .replace(/\0/g, "")
        .trim();
      return decoded || currency;
    } catch {
      return currency;
    }
  }

  return currency;
}
