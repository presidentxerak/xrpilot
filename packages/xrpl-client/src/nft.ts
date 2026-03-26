import {
  type Client,
  type NFTokenMint,
  type NFTokenBurn,
  type NFTokenCreateOffer,
  type NFTokenAcceptOffer,
  type AccountNFTsResponse,
} from "xrpl";
import type { DigitalObject, ObjectCategory } from "@pilot/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NFTInfo {
  /** NFToken ID (64-char hex) */
  readonly nftId: string;
  /** Issuer address */
  readonly issuer: string;
  /** Taxon (collection identifier) */
  readonly taxon: number;
  /** Serial number within the taxon */
  readonly serial: number;
  /** Transfer fee in basis points (0-50000) */
  readonly transferFee: number;
  /** Flags bitmask */
  readonly flags: number;
  /** URI (hex-encoded) */
  readonly uri?: string;
}

export interface MintNFTParams {
  /** Account minting the NFT */
  readonly account: string;
  /** Taxon / collection identifier */
  readonly taxon: number;
  /** URI pointing to the NFT metadata (will be hex-encoded) */
  readonly uri?: string;
  /** Transfer fee in basis points (0 to 50000, i.e. 0%-50%) */
  readonly transferFee?: number;
  /** Flags: 1 = burnable, 2 = only-xrp, 4 = trustline, 8 = transferable */
  readonly flags?: number;
}

export interface TransferNFTParams {
  /** Current owner of the NFT */
  readonly owner: string;
  /** NFToken ID to transfer */
  readonly nftId: string;
  /** Recipient address */
  readonly destination: string;
  /** Sale price (omit for a free transfer) */
  readonly amount?: string;
}

export interface BurnNFTParams {
  /** Owner of the NFT */
  readonly account: string;
  /** NFToken ID to burn */
  readonly nftId: string;
}

export interface NFTOffer {
  /** Offer index (ledger object ID) */
  readonly index: string;
  /** Owner of the offer */
  readonly owner: string;
  /** Amount offered / requested */
  readonly amount: string | { currency: string; issuer: string; value: string };
  /** Destination constraint, if any */
  readonly destination?: string;
  /** Whether this is a sell offer */
  readonly isSellOffer: boolean;
}

// ---------------------------------------------------------------------------
// NFT queries
// ---------------------------------------------------------------------------

/**
 * Fetch all NFTs owned by an account.
 */
export async function getAccountNFTs(
  client: Client,
  address: string,
): Promise<readonly NFTInfo[]> {
  const nfts: NFTInfo[] = [];
  let marker: unknown = undefined;

  do {
    const response: AccountNFTsResponse = await client.request({
      command: "account_nfts",
      account: address,
      ledger_index: "validated",
      marker: marker as undefined,
      limit: 100,
    });

    for (const nft of response.result.account_nfts) {
      nfts.push({
        nftId: nft.NFTokenID,
        issuer: nft.Issuer,
        taxon: nft.NFTokenTaxon,
        serial: nft.nft_serial,
        transferFee: nft.TransferFee ?? 0,
        flags: nft.Flags,
        uri: nft.URI,
      });
    }

    marker = response.result.marker;
  } while (marker !== undefined);

  return nfts;
}

// ---------------------------------------------------------------------------
// NFT transactions
// ---------------------------------------------------------------------------

/**
 * Build an NFTokenMint transaction.
 */
export function mintNFT(params: MintNFTParams): NFTokenMint {
  const tx: NFTokenMint = {
    TransactionType: "NFTokenMint",
    Account: params.account,
    NFTokenTaxon: params.taxon,
  };

  if (params.uri) {
    tx.URI = Buffer.from(params.uri, "utf8").toString("hex").toUpperCase();
  }

  if (params.transferFee !== undefined) {
    tx.TransferFee = params.transferFee;
  }

  if (params.flags !== undefined) {
    tx.Flags = params.flags;
  }

  return tx;
}

/**
 * Build transactions to transfer an NFT.
 *
 * Transfer is a two-step process on XRPL:
 * 1. Owner creates a sell offer (NFTokenCreateOffer with tfSellNFToken)
 * 2. Buyer accepts the offer (NFTokenAcceptOffer)
 *
 * This function returns the sell offer. The accept step happens after
 * the offer is on-ledger.
 */
export function createTransferOffer(
  params: TransferNFTParams,
): NFTokenCreateOffer {
  const tx: NFTokenCreateOffer = {
    TransactionType: "NFTokenCreateOffer",
    Account: params.owner,
    NFTokenID: params.nftId,
    Amount: params.amount ?? "0",
    Flags: 0x00000001, // tfSellNFToken
    Destination: params.destination,
  };

  return tx;
}

/**
 * Build a transaction to accept an existing NFT offer.
 */
export function acceptNFTOffer(
  account: string,
  sellOfferIndex: string,
): NFTokenAcceptOffer {
  return {
    TransactionType: "NFTokenAcceptOffer",
    Account: account,
    NFTokenSellOffer: sellOfferIndex,
  };
}

/**
 * Build an NFTokenBurn transaction.
 *
 * Warning: This permanently destroys the NFT.
 */
export function burnNFT(params: BurnNFTParams): NFTokenBurn {
  return {
    TransactionType: "NFTokenBurn",
    Account: params.account,
    NFTokenID: params.nftId,
  };
}

/**
 * Fetch all buy and sell offers for a given NFT.
 */
export async function getNFTOffers(
  client: Client,
  nftId: string,
): Promise<{ buyOffers: readonly NFTOffer[]; sellOffers: readonly NFTOffer[] }> {
  let buyOffers: NFTOffer[] = [];
  let sellOffers: NFTOffer[] = [];

  try {
    const buyResponse = await client.request({
      command: "nft_buy_offers",
      nft_id: nftId,
    });
    buyOffers = (
      buyResponse.result as { offers: Array<Record<string, unknown>> }
    ).offers.map((o) => ({
      index: o.nft_offer_index as string,
      owner: o.owner as string,
      amount: o.amount as NFTOffer["amount"],
      destination: o.destination as string | undefined,
      isSellOffer: false,
    }));
  } catch (error: unknown) {
    const err = error as { data?: { error?: string } };
    if (err.data?.error !== "objectNotFound") {
      throw error;
    }
    // No buy offers — that is fine
  }

  try {
    const sellResponse = await client.request({
      command: "nft_sell_offers",
      nft_id: nftId,
    });
    sellOffers = (
      sellResponse.result as { offers: Array<Record<string, unknown>> }
    ).offers.map((o) => ({
      index: o.nft_offer_index as string,
      owner: o.owner as string,
      amount: o.amount as NFTOffer["amount"],
      destination: o.destination as string | undefined,
      isSellOffer: true,
    }));
  } catch (error: unknown) {
    const err = error as { data?: { error?: string } };
    if (err.data?.error !== "objectNotFound") {
      throw error;
    }
    // No sell offers — that is fine
  }

  return { buyOffers, sellOffers };
}

// ---------------------------------------------------------------------------
// Mapping to Pilot DigitalObject
// ---------------------------------------------------------------------------

/**
 * Convert an XRPL NFT to the Pilot DigitalObject type.
 *
 * The URI is decoded and treated as a metadata URL.  If no URI is present,
 * sensible defaults are provided.
 */
export function mapNFTToDigitalObject(
  nft: NFTInfo,
  overrides?: Partial<Pick<DigitalObject, "name" | "image" | "utility" | "category">>,
): DigitalObject {
  const decodedUri = nft.uri
    ? Buffer.from(nft.uri, "hex").toString("utf8")
    : "";

  return {
    id: nft.nftId,
    name: overrides?.name ?? `NFT #${nft.serial}`,
    image: overrides?.image ?? decodedUri,
    metadata: {
      taxon: nft.taxon,
      serial: nft.serial,
      transferFee: nft.transferFee,
      flags: nft.flags,
      uri: decodedUri,
    },
    issuer: nft.issuer,
    utility: overrides?.utility ?? "Digital collectible on the XRP Ledger.",
    category: overrides?.category ?? inferCategory(nft),
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function inferCategory(nft: NFTInfo): ObjectCategory {
  // Simple heuristic — can be enhanced with on-chain metadata later
  if (nft.taxon === 0) return "collectible";
  if (nft.taxon >= 1 && nft.taxon <= 100) return "ticket";
  if (nft.taxon >= 101 && nft.taxon <= 200) return "pass";
  if (nft.taxon >= 201 && nft.taxon <= 300) return "coupon";
  return "nft";
}
