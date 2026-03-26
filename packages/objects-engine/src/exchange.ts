/**
 * Object Exchange -- Advanced Mode only.
 *
 * All functions in this module are gated behind the `advancedOnly` flag.
 * The exchange allows users to list, purchase and trade Digital Objects.
 */

import type {
  ObjectExchangeListing,
  ObjectFilter,
  PreparedTransaction,
} from "./types.js";

/** Marker that every exchange feature requires Advanced Mode */
export const advancedOnly = true as const;

// ---------------------------------------------------------------------------
// Create listing (sell offer)
// ---------------------------------------------------------------------------

export interface CreateListingParams {
  /** Object to list */
  readonly objectId: string;
  /** Asking price (in drops for XRP, or token amount) */
  readonly price: string;
  /** Currency code (e.g. "XRP") */
  readonly currency: string;
  /** Seller XRPL address */
  readonly seller: string;
}

/**
 * Create a sell offer for a Digital Object on the exchange.
 *
 * Builds an `NFTokenCreateOffer` transaction with the tfSellNFToken flag
 * and the specified price.
 */
export function createListing(params: CreateListingParams): {
  transaction: PreparedTransaction;
  advancedOnly: true;
} {
  const amount =
    params.currency === "XRP"
      ? params.price
      : {
          value: params.price,
          currency: params.currency,
          issuer: params.seller,
        };

  return {
    transaction: {
      TransactionType: "NFTokenCreateOffer",
      Account: params.seller,
      NFTokenID: params.objectId,
      Amount: amount,
      Flags: 1, // tfSellNFToken
    },
    advancedOnly: true,
  };
}

// ---------------------------------------------------------------------------
// Cancel listing
// ---------------------------------------------------------------------------

/**
 * Cancel an existing sell offer.
 *
 * @param offerId - The ledger offer object ID to cancel
 * @param account - The XRPL address that owns the offer
 */
export function cancelListing(
  offerId: string,
  account: string,
): {
  transaction: PreparedTransaction;
  advancedOnly: true;
} {
  return {
    transaction: {
      TransactionType: "NFTokenCancelOffer",
      Account: account,
      NFTokenOffers: [offerId],
    },
    advancedOnly: true,
  };
}

// ---------------------------------------------------------------------------
// Purchase object
// ---------------------------------------------------------------------------

/**
 * Purchase a listed object by accepting its sell offer.
 *
 * @param offerId - Sell offer to accept
 * @param buyer   - Buyer XRPL address
 */
export function purchaseObject(
  offerId: string,
  buyer: string,
): {
  transaction: PreparedTransaction;
  advancedOnly: true;
} {
  return {
    transaction: {
      TransactionType: "NFTokenAcceptOffer",
      Account: buyer,
      NFTokenSellOffer: offerId,
    },
    advancedOnly: true,
  };
}

// ---------------------------------------------------------------------------
// Get listings
// ---------------------------------------------------------------------------

/**
 * Fetch active exchange listings.
 *
 * Callers supply a fetcher so the engine stays transport-agnostic.
 */
export async function getListings(
  filter: ObjectFilter | undefined,
  fetchListings: (
    filter?: ObjectFilter,
  ) => Promise<readonly ObjectExchangeListing[]>,
): Promise<{ listings: readonly ObjectExchangeListing[]; advancedOnly: true }> {
  const listings = await fetchListings(filter);
  return { listings, advancedOnly: true };
}

// ---------------------------------------------------------------------------
// Fee estimation
// ---------------------------------------------------------------------------

export interface FeeEstimate {
  /** Network transaction fee in drops */
  readonly networkFee: string;
  /** Royalty / transfer fee percentage (0-50 %) */
  readonly royaltyPercent: number;
  /** Royalty amount in the listing currency */
  readonly royaltyAmount: string;
  /** Total cost to the buyer (price + fees) */
  readonly totalCost: string;
  /** Human-readable fee summary */
  readonly summary: string;
  /** Exchange features require Advanced Mode */
  readonly advancedOnly: true;
}

/**
 * Estimate the fees for purchasing a listed object.
 *
 * @param listing - The exchange listing
 * @param transferFeePercent - The NFToken transfer fee in basis points (0-50000 -> 0-50%)
 * @param networkFeeDrop - Network fee in drops (default "12")
 */
export function estimateFees(
  listing: ObjectExchangeListing,
  transferFeePercent: number = 0,
  networkFeeDrop: string = "12",
): FeeEstimate {
  const price = BigInt(listing.price);
  const royaltyBps = Math.min(transferFeePercent, 50000);
  const royaltyAmount = (price * BigInt(royaltyBps)) / BigInt(100000);
  const totalCost = price + royaltyAmount + BigInt(networkFeeDrop);
  const royaltyPct = royaltyBps / 1000;

  const parts: string[] = [`Price: ${listing.price} ${listing.currency}`];
  if (royaltyBps > 0) {
    parts.push(`Royalty (${royaltyPct}%): ${royaltyAmount.toString()} ${listing.currency}`);
  }
  parts.push(`Network fee: ${networkFeeDrop} drops`);
  parts.push(`Total: ${totalCost.toString()}`);

  return {
    networkFee: networkFeeDrop,
    royaltyPercent: royaltyPct,
    royaltyAmount: royaltyAmount.toString(),
    totalCost: totalCost.toString(),
    summary: parts.join(" | "),
    advancedOnly: true,
  };
}
