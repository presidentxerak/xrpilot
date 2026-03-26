'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DigitalObject {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  issuer: string;
  issuerName?: string;
  issuerVerified?: boolean;
  utility?: string;
  tokenId?: string;
  transferable?: boolean;
  createdAt?: string;
  flags?: number;
  history?: Array<{
    type: string;
    from: string;
    to: string;
    date: string;
  }>;
}

export function useMyObjects(address: string) {
  return useQuery({
    queryKey: ['objects', address],
    queryFn: async (): Promise<DigitalObject[]> => {
      if (!address) return [];
      const response = await fetch(
        `/api/objects?address=${address}`
      ).catch(() => null);
      if (response?.ok) {
        const data = await response.json();
        return data.objects ?? [];
      }
      return [];
    },
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useObject(id: string) {
  return useQuery({
    queryKey: ['object', id],
    queryFn: async (): Promise<DigitalObject | null> => {
      if (!id) return null;
      const response = await fetch(`/api/objects/${id}`).catch(() => null);
      if (response?.ok) {
        return response.json();
      }
      return null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

interface TransferObjectParams {
  objectId: string;
  from: string;
  to: string;
}

export function useTransferObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TransferObjectParams) => {
      const response = await fetch('/api/objects/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message ?? 'Transfer failed. Please try again.'
        );
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['objects', variables.from],
      });
      queryClient.invalidateQueries({
        queryKey: ['object', variables.objectId],
      });
    },
  });
}
