'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useBalance(address: string) {
  return useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) return 0;
      // In production, this would call @pilot/xrpl-client
      // For now, return a placeholder that integrates with the wallet store
      const response = await fetch(`/api/balance?address=${address}`).catch(
        () => null
      );
      if (response?.ok) {
        const data = await response.json();
        return Number(data.balance ?? 0);
      }
      return 0;
    },
    enabled: !!address,
    refetchInterval: 10_000,
    staleTime: 10_000,
  });
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  currency: string;
  address: string;
  date: string;
  status: 'confirmed' | 'pending';
  destinationTag?: number;
}

export function useTransactionHistory(address: string) {
  return useQuery({
    queryKey: ['transactions', address],
    queryFn: async (): Promise<Transaction[]> => {
      if (!address) return [];
      const response = await fetch(
        `/api/transactions?address=${address}`
      ).catch(() => null);
      if (response?.ok) {
        const data = await response.json();
        return data.transactions ?? [];
      }
      return [];
    },
    enabled: !!address,
    staleTime: 10_000,
  });
}

export interface AccountToken {
  currency: string;
  balance: string;
  issuer: string;
  name?: string;
}

export function useAccountTokens(address: string) {
  return useQuery({
    queryKey: ['tokens', address],
    queryFn: async (): Promise<AccountToken[]> => {
      if (!address) return [];
      const response = await fetch(
        `/api/tokens?address=${address}`
      ).catch(() => null);
      if (response?.ok) {
        const data = await response.json();
        return data.tokens ?? [];
      }
      return [];
    },
    enabled: !!address,
    staleTime: 30_000,
  });
}

interface SendXrpParams {
  from: string;
  to: string;
  amount: number;
  destinationTag?: number;
}

export function useSendXrp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendXrpParams) => {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message ?? 'Failed to send. Please try again.'
        );
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['balance', variables.from] });
      queryClient.invalidateQueries({
        queryKey: ['transactions', variables.from],
      });
    },
  });
}
