"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAccountInfo, getTransactionHistory, sendXrp } from "@/lib/wallet/transactions";
import type {
  AccountInfo,
  TransactionRecord,
  SendXrpParams,
  SendXrpResult,
} from "@/lib/wallet/types";
import { useWalletStore } from "@/stores/wallet-store";

const BALANCE_POLL_INTERVAL_MS = 10_000;

/**
 * Polls account balance every 10 seconds while the component is mounted.
 */
export function useBalance(address: string | null) {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setBalance = useWalletStore((s) => s.setBalance);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setAccountInfo(null);
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const info = await getAccountInfo(address);
      setAccountInfo(info);
      setBalance(info.balance);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address, setBalance]);

  useEffect(() => {
    fetchBalance();

    if (!address) return;

    const interval = setInterval(fetchBalance, BALANCE_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [address, fetchBalance]);

  return { accountInfo, isLoading, error, refetch: fetchBalance };
}

/**
 * Fetches transaction history for an account.
 */
export function useTransactionHistory(address: string | null) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const history = await getTransactionHistory(address);
      setTransactions(history);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { transactions, isLoading, error, refetch: fetchHistory };
}

/**
 * Provides a mutation function for sending XRP.
 */
export function useSendXrp() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendXrpResult | null>(null);
  const abortRef = useRef(false);

  const send = useCallback(async (params: SendXrpParams) => {
    abortRef.current = false;
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const txResult = await sendXrp(params);

      if (!abortRef.current) {
        setResult(txResult);
      }

      return txResult;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Transaction failed";
      if (!abortRef.current) {
        setError(message);
      }
      throw err;
    } finally {
      if (!abortRef.current) {
        setIsSubmitting(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setIsSubmitting(false);
    setError(null);
    setResult(null);
  }, []);

  return { send, isSubmitting, error, result, reset };
}
