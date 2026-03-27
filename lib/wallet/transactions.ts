import { Wallet, convertStringToHex } from "xrpl";
import type { Payment } from "xrpl";
import { getClient } from "@/lib/wallet/connection";
import { dropsToXrp, formatXrp, calculateAvailableBalance } from "@/lib/wallet/balance";
import type {
  SendXrpParams,
  SendXrpResult,
  AccountInfo,
  TransactionRecord,
} from "@/lib/wallet/types";

/**
 * Sends XRP from one account to another.
 */
export async function sendXrp(params: SendXrpParams): Promise<SendXrpResult> {
  const { fromSeed, to, amountInDrops, memo, destinationTag } = params;

  const client = await getClient();
  const wallet = Wallet.fromSeed(fromSeed);

  const payment: Payment = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Destination: to,
    Amount: amountInDrops,
  };

  if (destinationTag !== undefined) {
    payment.DestinationTag = destinationTag;
  }

  if (memo) {
    payment.Memos = [
      {
        Memo: {
          MemoData: convertStringToHex(memo),
          MemoType: convertStringToHex("text/plain"),
        },
      },
    ];
  }

  const prepared = await client.autofill(payment);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  const meta = result.result.meta;
  const resultCode =
    typeof meta === "object" && meta !== null && "TransactionResult" in meta
      ? (meta as { TransactionResult: string }).TransactionResult
      : "unknown";

  return {
    hash: result.result.hash,
    status: resultCode === "tesSUCCESS" ? "success" : "failed",
    resultCode,
    fee: prepared.Fee ?? "0",
  };
}

/**
 * Returns a human-readable description of a pending send transaction.
 */
export function toHumanReadable(
  amountInDrops: string,
  currentBalanceInDrops: string,
  ownerCount: number
): string {
  const sendingXrp = formatXrp(amountInDrops);
  const currentAvailable = calculateAvailableBalance(
    currentBalanceInDrops,
    ownerCount
  );
  const remainingDrops =
    Number(currentAvailable) - Number(amountInDrops);
  const remainingXrp =
    remainingDrops > 0 ? formatXrp(remainingDrops.toString()) : "0";

  return `You are sending ${sendingXrp} XRP. After this, you will have ${remainingXrp} XRP available.`;
}

/**
 * Retrieves account info from the ledger.
 */
export async function getAccountInfo(address: string): Promise<AccountInfo> {
  const client = await getClient();

  const response = await client.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });

  const accountData = response.result.account_data;

  return {
    address: accountData.Account,
    balance: accountData.Balance as string,
    ownerCount: accountData.OwnerCount,
    sequence: accountData.Sequence,
  };
}

/**
 * Retrieves recent transaction history for an account.
 */
export async function getTransactionHistory(
  address: string,
  limit: number = 20
): Promise<TransactionRecord[]> {
  const client = await getClient();

  const response = await client.request({
    command: "account_tx",
    account: address,
    limit,
    ledger_index_min: -1,
    ledger_index_max: -1,
  });

  const transactions: TransactionRecord[] = [];

  for (const txEntry of response.result.transactions) {
    const tx = txEntry.tx_json;
    if (!tx) continue;

    const meta = txEntry.meta;
    const resultCode =
      typeof meta === "object" && meta !== null && "TransactionResult" in meta
        ? (meta as { TransactionResult: string }).TransactionResult
        : "unknown";

    const amount =
      tx.TransactionType === "Payment" && typeof tx.Amount === "string"
        ? tx.Amount
        : "0";

    const closeTime = (txEntry as unknown as Record<string, unknown>).close_time_iso
      ? new Date((txEntry as unknown as Record<string, unknown>).close_time_iso as string).getTime()
      : 0;

    transactions.push({
      hash: txEntry.hash ?? "",
      type: tx.TransactionType ?? "Unknown",
      from: (tx.Account as string) ?? "",
      to:
        tx.TransactionType === "Payment"
          ? ((tx as Record<string, unknown>).Destination as string) ?? ""
          : "",
      amount: dropsToXrp(amount),
      fee: dropsToXrp(tx.Fee ?? "0"),
      timestamp: closeTime,
      sequence: tx.Sequence ?? 0,
      status: resultCode === "tesSUCCESS" ? "success" : "failed",
    });
  }

  return transactions;
}
