/**
 * Object transfer operations.
 *
 * Builds the XRPL transactions needed to transfer a Digital Object between
 * accounts and converts them to human-readable summaries for Pilot's UI.
 */

import type { DigitalObject, PreparedTransaction, TransferRecord } from "./types.js";

// ---------------------------------------------------------------------------
// Prepare transfer (NFTokenCreateOffer with Amount = 0)
// ---------------------------------------------------------------------------

export interface TransferParams {
  /** The Digital Object being transferred */
  readonly objectId: string;
  /** Sender XRPL address */
  readonly from: string;
  /** Recipient XRPL address */
  readonly to: string;
}

/**
 * Build an `NFTokenCreateOffer` transaction to transfer an object at no cost.
 *
 * The resulting transaction sets `Amount = "0"` and the `tfSellNFToken` flag
 * so the sender creates a free sell offer directed at the recipient.
 */
export function prepareTransfer(params: TransferParams): PreparedTransaction {
  return {
    TransactionType: "NFTokenCreateOffer",
    Account: params.from,
    NFTokenID: params.objectId,
    Destination: params.to,
    Amount: "0",
    Flags: 1, // tfSellNFToken
  };
}

// ---------------------------------------------------------------------------
// Accept transfer
// ---------------------------------------------------------------------------

/**
 * Build an `NFTokenAcceptOffer` transaction so the recipient can accept the
 * incoming transfer offer.
 *
 * @param offerId - The ledger offer ID to accept
 * @param account - The XRPL address accepting the offer
 */
export function prepareAcceptTransfer(
  offerId: string,
  account: string,
): PreparedTransaction {
  return {
    TransactionType: "NFTokenAcceptOffer",
    Account: account,
    NFTokenSellOffer: offerId,
  };
}

// ---------------------------------------------------------------------------
// Transfer history
// ---------------------------------------------------------------------------

/**
 * Retrieve the transfer history for an object.
 *
 * This is a data-access boundary -- callers supply a fetcher so the engine
 * stays transport-agnostic.
 *
 * @param objectId - The NFToken ID
 * @param fetchHistory - Callback returning the raw transfer records
 */
export async function getTransferHistory(
  objectId: string,
  fetchHistory: (id: string) => Promise<readonly TransferRecord[]>,
): Promise<readonly TransferRecord[]> {
  return fetchHistory(objectId);
}

// ---------------------------------------------------------------------------
// Human-readable summary
// ---------------------------------------------------------------------------

/**
 * Convert a transfer into a plain-English summary suitable for display in
 * Pilot's confirmation screen.
 *
 * @param objectName - Display name of the object being transferred
 * @param to - Destination XRPL address
 */
export function toHumanReadable(objectName: string, to: string): string {
  const shortAddress =
    to.length > 12 ? `${to.slice(0, 6)}...${to.slice(-4)}` : to;
  return `You are sending ${objectName} to ${shortAddress}`;
}

/**
 * Build a full human-readable description from a DigitalObject and destination.
 */
export function toHumanReadableFromObject(
  obj: DigitalObject,
  to: string,
): string {
  return toHumanReadable(obj.name, to);
}
