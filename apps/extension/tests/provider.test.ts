import { describe, it, expect } from 'vitest';
import type { PilotProvider, PilotRequest, PilotResponse, PilotEvent } from '../src/content-script/provider';

describe('Provider type definitions', () => {
  describe('PilotProvider interface', () => {
    it('should define the correct shape for a provider object', () => {
      // Verify the interface shape at the type level by constructing a valid mock
      const mockProvider: PilotProvider = {
        connect: async () => ({ address: 'rTestAddress123' }),
        getAddress: async () => 'rTestAddress123',
        signTransaction: async (_tx: Record<string, unknown>) => ({
          hash: 'ABC123',
          blob: '1200002200000000',
        }),
        disconnect: async () => {},
        on: (_event: PilotEvent, _callback: (data: unknown) => void) => {},
        off: (_event: PilotEvent, _callback: (data: unknown) => void) => {},
      };

      expect(mockProvider).toBeDefined();
      expect(typeof mockProvider.connect).toBe('function');
      expect(typeof mockProvider.getAddress).toBe('function');
      expect(typeof mockProvider.signTransaction).toBe('function');
      expect(typeof mockProvider.disconnect).toBe('function');
      expect(typeof mockProvider.on).toBe('function');
      expect(typeof mockProvider.off).toBe('function');
    });

    it('should support all event types', () => {
      const events: PilotEvent[] = ['connect', 'disconnect', 'accountChanged', 'networkChanged'];
      expect(events).toHaveLength(4);
      expect(events).toContain('connect');
      expect(events).toContain('disconnect');
      expect(events).toContain('accountChanged');
      expect(events).toContain('networkChanged');
    });
  });

  describe('PilotRequest structure', () => {
    it('should have the correct required fields', () => {
      const request: PilotRequest = {
        type: 'CONNECT',
        origin: 'https://example.com',
        id: 1,
      };

      expect(request.type).toBe('CONNECT');
      expect(request.origin).toBe('https://example.com');
      expect(request.id).toBe(1);
      expect(request.payload).toBeUndefined();
    });

    it('should support optional payload', () => {
      const request: PilotRequest = {
        type: 'SIGN_TRANSACTION',
        payload: { transaction: { TransactionType: 'Payment' } },
        origin: 'https://example.com',
        id: 2,
      };

      expect(request.payload).toBeDefined();
      expect(request.payload?.transaction).toBeDefined();
    });

    it('should use incrementing request IDs', () => {
      const requests: PilotRequest[] = [
        { type: 'CONNECT', origin: 'https://a.com', id: 1 },
        { type: 'GET_ADDRESS', origin: 'https://a.com', id: 2 },
        { type: 'SIGN_TRANSACTION', origin: 'https://a.com', id: 3 },
      ];

      for (let i = 1; i < requests.length; i++) {
        expect(requests[i].id).toBeGreaterThan(requests[i - 1].id);
      }
    });
  });

  describe('PilotResponse structure', () => {
    it('should represent a successful response', () => {
      const response: PilotResponse = {
        success: true,
        data: { address: 'rTestAddress123' },
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should represent an error response', () => {
      const response: PilotResponse = {
        success: false,
        error: 'Wallet is locked',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Wallet is locked');
      expect(response.data).toBeUndefined();
    });
  });

  describe('Message format for page-to-content-script communication', () => {
    it('should use the correct source identifier for provider messages', () => {
      const message = {
        source: 'pilot-provider',
        type: 'CONNECT',
        payload: undefined,
        id: 1,
      };

      expect(message.source).toBe('pilot-provider');
    });

    it('should use the correct source identifier for background responses', () => {
      const message = {
        source: 'pilot-background',
        id: 1,
        response: { address: 'rTestAddress123' },
      };

      expect(message.source).toBe('pilot-background');
    });

    it('should use the correct source identifier for background events', () => {
      const message = {
        source: 'pilot-event',
        event: 'accountChanged',
        data: { address: 'rNewAddress456' },
      };

      expect(message.source).toBe('pilot-event');
    });
  });
});
