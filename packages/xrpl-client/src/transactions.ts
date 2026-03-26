import {
  type Client,
  type Payment,
  type Transaction,
  type TxResponse,
  Wallet,
  xrpToDrops,
  dropsToXrp,
} from "xrpl";
import type {
  HumanReadableTransaction,
  TransactionResult,
  TransactionStatus,
} from "@pilot/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendXrpParams {
  /** Sender's XRPL classic address */
  readonly from: string;
  /** Recipient's XRPL classic address */
  readonly to: string;
  /** Amount of XRP to send (human-readable, e.g. "25") */
  readonly amount: string;
  /** Optional destination tag */
  readonly destinationTag?: number;
  /** Optional memos (plain text) */
  readonly memos?: readonly string[];
}

export interface PreparedTransaction {
  /** The fully auto-filled transaction, ready to sign */
  readonly tx: Transaction;
}

export interface SignedTransaction {
  /** Hex-encoded signed transaction blob */
  readonly txBlob: string;
  /** Transaction hash */
  readonly hash: string;
}

// ---------------------------------------------------------------------------
// Transaction helpers
// ---------------------------------------------------------------------------

/**
 * Build a Payment transaction for sending XRP.
 * The returned transaction still needs to be prepared (auto-filled),
 * signed, and submitted.
 */
export function buildSendXrpTransaction(params: SendXrpParams): Payment {
  const tx: Payment = {
    TransactionType: "Payment",
    Account: params.from,
    Destination: params.to,
    Amount: xrpToDrops(params.amount),
  };

  if (params.destinationTag !== undefined) {
    tx.DestinationTag = params.destinationTag;
  }

  if (params.memos && params.memos.length > 0) {
    tx.Memos = params.memos.map((text) => ({
      Memo: {
        MemoType: Buffer.from("text/plain", "utf8").toString("hex"),
        MemoData: Buffer.from(text, "utf8").toString("hex"),
      },
    }));
  }

  return tx;
}

/**
 * Auto-fill a transaction with the current fee, sequence number,
 * and last ledger sequence.
 */
export async function prepareTransaction(
  client: Client,
  tx: Transaction,
): Promise<PreparedTransaction> {
  const prepared = await client.autofill(tx);
  return { tx: prepared as Transaction };
}

/**
 * Sign a prepared transaction with the given private key (seed / secret).
 */
export function signTransaction(
  tx: Transaction,
  privateKey: string,
): SignedTransaction {
  const wallet = Wallet.fromSeed(privateKey);
  const signed = wallet.sign(tx);
  return {
    txBlob: signed.tx_blob,
    hash: signed.hash,
  };
}

/**
 * Submit a signed transaction and wait for it to be validated on-ledger.
 */
export async function submitTransaction(
  client: Client,
  txBlob: string,
): Promise<TransactionResult> {
  const submittedAt = new Date().toISOString();

  const response = await client.submitAndWait(txBlob);

  const meta =
    typeof response.result.meta === "object" ? response.result.meta : null;
  const resultCode =
    meta && "TransactionResult" in meta
      ? (meta.TransactionResult as string)
      : "unknown";

  const status: TransactionStatus = resultCode.startsWith("tes")
    ? ("validated" as TransactionStatus)
    : ("failed" as TransactionStatus);

  return {
    hash: response.result.hash,
    ledgerIndex:
      typeof response.result.ledger_index === "number"
        ? response.result.ledger_index
        : undefined,
    status,
    resultCode,
    resultMessage: resultCodeToMessage(resultCode),
    submittedAt,
    fee: String(response.result.Fee ?? "0"),
  };
}

/**
 * Estimates the current transaction fee (in drops).
 */
export async function getTransactionFee(client: Client): Promise<string> {
  const serverInfo = await client.request({ command: "server_info" });
  const loadFee =
    serverInfo.result.info.validated_ledger?.base_fee_xrp ?? 0.000012;
  return xrpToDrops(String(loadFee));
}

// ---------------------------------------------------------------------------
// Human-readable descriptions
// ---------------------------------------------------------------------------

/**
 * Convert any XRPL transaction into a plain-English description suitable
 * for showing to the end user before they approve it.
 */
export function toHumanReadable(
  tx: Transaction,
  accountBalance?: string,
): HumanReadableTransaction {
  const type = tx.TransactionType;
  const warnings: string[] = [];

  switch (type) {
    case "Payment": {
      const payment = tx as Payment;
      const dest = payment.Destination;
      const shortDest = abbreviateAddress(dest);

      if (typeof payment.Amount === "string") {
        const xrpAmount = dropsToXrp(payment.Amount);
        const summary = `Send ${xrpAmount} XRP to ${shortDest}`;
        let description = `You are sending ${xrpAmount} XRP to ${dest}.`;

        if (payment.DestinationTag !== undefined) {
          description += ` Destination tag: ${payment.DestinationTag}.`;
        }

        if (accountBalance) {
          const remaining =
            Number(dropsToXrp(accountBalance)) - Number(xrpAmount);
          description += ` After this, you will have approximately ${remaining.toFixed(2)} XRP available.`;
          if (remaining < 10) {
            warnings.push(
              "Your remaining balance will be very low. The XRPL requires a minimum reserve of 10 XRP.",
            );
          }
        }

        return { summary, description, type, warnings };
      }

      // Token payment
      const amt = payment.Amount as {
        currency: string;
        value: string;
        issuer?: string;
      };
      const summary = `Send ${amt.value} ${amt.currency} to ${shortDest}`;
      const description = `You are sending ${amt.value} ${amt.currency} (issued by ${amt.issuer ?? "unknown"}) to ${dest}.`;
      return { summary, description, type, warnings };
    }

    case "TrustSet": {
      const limit = (tx as Record<string, unknown>).LimitAmount as {
        currency: string;
        issuer: string;
        value: string;
      };
      if (Number(limit.value) === 0) {
        return {
          summary: `Remove trust for ${limit.currency}`,
          description: `You are removing the ${limit.currency} token (issuer: ${limit.issuer}) from your wallet. Any remaining balance must be zero first.`,
          type,
          warnings,
        };
      }
      return {
        summary: `Allow ${limit.currency} in your wallet`,
        description: `You are adding a trust line for ${limit.currency} (issuer: ${limit.issuer}) with a limit of ${limit.value}. This allows you to hold this token.`,
        type,
        warnings,
      };
    }

    case "OfferCreate": {
      const takerPays = formatCurrencyAmount(
        (tx as Record<string, unknown>).TakerPays,
      );
      const takerGets = formatCurrencyAmount(
        (tx as Record<string, unknown>).TakerGets,
      );
      return {
        summary: `Swap ${takerGets.display} for ${takerPays.display}`,
        description: `You are offering ${takerGets.display} in exchange for ${takerPays.display} on the XRPL decentralized exchange.`,
        type,
        warnings,
      };
    }

    case "OfferCancel": {
      const seq = (tx as Record<string, unknown>).OfferSequence as number;
      return {
        summary: `Cancel offer #${seq}`,
        description: `You are cancelling your open DEX offer with sequence number ${seq}.`,
        type,
        warnings,
      };
    }

    case "NFTokenMint": {
      return {
        summary: "Mint a new digital object",
        description:
          "You are minting a new NFT (digital object) on the XRP Ledger.",
        type,
        warnings,
      };
    }

    case "NFTokenBurn": {
      return {
        summary: "Burn a digital object",
        description:
          "You are permanently destroying an NFT. This action cannot be undone.",
        type,
        warnings: ["This action is irreversible."],
      };
    }

    case "NFTokenCreateOffer": {
      return {
        summary: "Create an offer for a digital object",
        description:
          "You are creating a buy or sell offer for an NFT on the XRP Ledger.",
        type,
        warnings,
      };
    }

    case "NFTokenAcceptOffer": {
      return {
        summary: "Accept a digital object offer",
        description:
          "You are accepting an existing offer to buy or sell an NFT. The transfer will complete immediately.",
        type,
        warnings,
      };
    }

    default:
      return {
        summary: `${type} transaction`,
        description: `You are submitting a ${type} transaction to the XRP Ledger.`,
        type,
        warnings,
      };
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function abbreviateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatCurrencyAmount(amount: unknown): { display: string } {
  if (typeof amount === "string") {
    return { display: `${dropsToXrp(amount)} XRP` };
  }
  const obj = amount as { currency: string; value: string; issuer?: string };
  return { display: `${obj.value} ${obj.currency}` };
}

function resultCodeToMessage(code: string): string {
  const messages: Record<string, string> = {
    tesSUCCESS: "Transaction succeeded.",
    tecUNFUNDED_PAYMENT: "Insufficient funds to complete the payment.",
    tecNO_DST_INSUF_XRP:
      "The destination account does not exist and the payment is not enough to create it (minimum 10 XRP).",
    tecNO_DST: "The destination account does not exist.",
    tecPATH_DRY:
      "The payment could not find a path with enough liquidity to deliver the amount.",
    tecNO_LINE:
      "The destination does not have a trust line for this token.",
    tefPAST_SEQ:
      "The transaction sequence number is too old. Please try again.",
    tefMAX_LEDGER:
      "The transaction expired before it could be included in a validated ledger.",
    terRETRY: "The transaction should be retried.",
  };

  return messages[code] ?? `Transaction completed with result: ${code}`;
}
