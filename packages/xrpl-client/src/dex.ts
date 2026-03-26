import {
  type Client,
  type OfferCreate,
  type OfferCancel,
  type BookOffersResponse,
  dropsToXrp,
  xrpToDrops,
} from "xrpl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CurrencyAmount {
  /** "XRP" for native, or the currency code for tokens */
  readonly currency: string;
  /** Issuer address — omit for XRP */
  readonly issuer?: string;
  /** Amount as a decimal string */
  readonly value: string;
}

export interface OrderBookEntry {
  /** Account that placed the offer */
  readonly account: string;
  /** What the taker pays (what is being asked) */
  readonly takerPays: CurrencyAmount;
  /** What the taker gets (what is being offered) */
  readonly takerGets: CurrencyAmount;
  /** Offer sequence number */
  readonly sequence: number;
  /** Exchange rate (takerPays.value / takerGets.value) */
  readonly rate: number;
}

export interface OrderBook {
  /** Asks (sell orders) sorted by best price first */
  readonly asks: readonly OrderBookEntry[];
  /** Bids (buy orders) sorted by best price first */
  readonly bids: readonly OrderBookEntry[];
}

export interface SwapOfferParams {
  /** The account creating the offer */
  readonly account: string;
  /** What the creator wants to receive */
  readonly takerPays: CurrencyAmount;
  /** What the creator is willing to give */
  readonly takerGets: CurrencyAmount;
  /** Optional: passive offer that won't match existing offers */
  readonly passive?: boolean;
  /** Optional: immediately cancel if not fully filled */
  readonly fillOrKill?: boolean;
  /** Optional: allow partial fills then cancel the remainder */
  readonly immediateOrCancel?: boolean;
}

export interface SwapEstimate {
  /** Expected output amount */
  readonly estimatedOutput: CurrencyAmount;
  /** Minimum output after slippage */
  readonly minimumOutput: CurrencyAmount;
  /** Effective price */
  readonly effectivePrice: string;
  /** Slippage percentage */
  readonly slippagePercent: number;
  /** Whether the estimate could be filled (enough liquidity) */
  readonly canFill: boolean;
  /** Human-readable warning, if any */
  readonly warning?: string;
}

// ---------------------------------------------------------------------------
// DEX operations
// ---------------------------------------------------------------------------

/**
 * Fetch the current order book for a currency pair.
 */
export async function getOrderBook(
  client: Client,
  base: CurrencyAmount,
  counter: CurrencyAmount,
): Promise<OrderBook> {
  const toXrplCurrency = (c: CurrencyAmount) =>
    c.currency === "XRP"
      ? { currency: "XRP" as const }
      : { currency: c.currency, issuer: c.issuer! };

  const [askResponse, bidResponse] = await Promise.all([
    client.request({
      command: "book_offers",
      taker_pays: toXrplCurrency(counter),
      taker_gets: toXrplCurrency(base),
      limit: 50,
    }) as Promise<BookOffersResponse>,
    client.request({
      command: "book_offers",
      taker_pays: toXrplCurrency(base),
      taker_gets: toXrplCurrency(counter),
      limit: 50,
    }) as Promise<BookOffersResponse>,
  ]);

  const asks = askResponse.result.offers.map(parseOrderBookEntry);
  const bids = bidResponse.result.offers.map(parseOrderBookEntry);

  return { asks, bids };
}

/**
 * Build an OfferCreate transaction for a DEX swap.
 */
export function createSwapOffer(params: SwapOfferParams): OfferCreate {
  const tx: OfferCreate = {
    TransactionType: "OfferCreate",
    Account: params.account,
    TakerPays: toXrplAmount(params.takerPays),
    TakerGets: toXrplAmount(params.takerGets),
  };

  let flags = 0;
  if (params.passive) flags |= 0x00010000; // tfPassive
  if (params.fillOrKill) flags |= 0x00040000; // tfFillOrKill
  if (params.immediateOrCancel) flags |= 0x00020000; // tfImmediateOrCancel

  if (flags > 0) {
    tx.Flags = flags;
  }

  return tx;
}

/**
 * Build an OfferCancel transaction.
 */
export function cancelOffer(
  account: string,
  offerSequence: number,
): OfferCancel {
  return {
    TransactionType: "OfferCancel",
    Account: account,
    OfferSequence: offerSequence,
  };
}

/**
 * Estimate the output of a swap by walking the order book.
 */
export async function estimateSwap(
  client: Client,
  from: CurrencyAmount,
  to: CurrencyAmount,
  amount: string,
  slippageTolerance: number = 0.01,
): Promise<SwapEstimate> {
  const orderBook = await getOrderBook(client, to, from);
  const offers = orderBook.asks;

  let remainingInput = Number(amount);
  let totalOutput = 0;
  let canFill = true;

  for (const offer of offers) {
    if (remainingInput <= 0) break;

    const offerInput = Number(offer.takerPays.value);
    const offerOutput = Number(offer.takerGets.value);
    const rate = offerOutput / offerInput;

    const consumed = Math.min(remainingInput, offerInput);
    totalOutput += consumed * rate;
    remainingInput -= consumed;
  }

  if (remainingInput > 0) {
    canFill = false;
  }

  const effectivePrice =
    totalOutput > 0 ? (Number(amount) / totalOutput).toFixed(8) : "0";
  const minimumOutput = totalOutput * (1 - slippageTolerance);
  const slippagePercent = slippageTolerance * 100;

  const warning = !canFill
    ? `Not enough liquidity to fill the entire order. Only ${(Number(amount) - remainingInput).toFixed(6)} ${from.currency} can be swapped.`
    : undefined;

  return {
    estimatedOutput: {
      currency: to.currency,
      issuer: to.issuer,
      value: totalOutput.toFixed(6),
    },
    minimumOutput: {
      currency: to.currency,
      issuer: to.issuer,
      value: minimumOutput.toFixed(6),
    },
    effectivePrice,
    slippagePercent,
    canFill,
    warning,
  };
}

/**
 * Generate a human-readable slippage warning.
 */
export function getSlippageWarning(
  estimatedOutput: string,
  minimumOutput: string,
  currency: string,
): string {
  const diff = Number(estimatedOutput) - Number(minimumOutput);
  const pct =
    Number(estimatedOutput) > 0
      ? ((diff / Number(estimatedOutput)) * 100).toFixed(1)
      : "0";

  if (diff <= 0) {
    return "No slippage expected.";
  }

  return (
    `You may receive between ${minimumOutput} and ${estimatedOutput} ${currency}. ` +
    `The maximum slippage is ${pct}%, which means you could receive up to ${diff.toFixed(6)} ${currency} less than expected.`
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseOrderBookEntry(offer: Record<string, unknown>): OrderBookEntry {
  const takerPays = parseCurrencyAmount(offer.TakerPays);
  const takerGets = parseCurrencyAmount(offer.TakerGets);
  const rate =
    Number(takerPays.value) > 0
      ? Number(takerPays.value) / Number(takerGets.value)
      : 0;

  return {
    account: offer.Account as string,
    takerPays,
    takerGets,
    sequence: offer.Sequence as number,
    rate,
  };
}

function parseCurrencyAmount(amount: unknown): CurrencyAmount {
  if (typeof amount === "string") {
    return {
      currency: "XRP",
      value: dropsToXrp(amount),
    };
  }

  const obj = amount as { currency: string; value: string; issuer?: string };
  return {
    currency: obj.currency,
    issuer: obj.issuer,
    value: obj.value,
  };
}

function toXrplAmount(
  amount: CurrencyAmount,
): string | { currency: string; issuer: string; value: string } {
  if (amount.currency === "XRP") {
    return xrpToDrops(amount.value);
  }
  return {
    currency: amount.currency,
    issuer: amount.issuer!,
    value: amount.value,
  };
}
