import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageHandler } from '../src/background/message-handler';
import { ConnectionManager } from '../src/background/connection-manager';

// Mock chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
  action: {
    openPopup: vi.fn().mockResolvedValue(undefined),
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
};

vi.stubGlobal('chrome', mockChrome);
vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-1234' });

function createState(overrides = {}) {
  return {
    isLocked: false,
    address: 'rTestAddress1234567890',
    network: 'mainnet',
    autoLockTimer: null,
    autoLockDuration: 15 * 60 * 1000,
    ...overrides,
  };
}

describe('MessageHandler', () => {
  let connectionManager: ConnectionManager;
  let handler: MessageHandler;
  let state: ReturnType<typeof createState>;

  beforeEach(() => {
    vi.clearAllMocks();
    connectionManager = new ConnectionManager();
    state = createState();
    handler = new MessageHandler(connectionManager, state);
  });

  describe('CONNECT message handling', () => {
    it('should return error when wallet is locked', async () => {
      state.isLocked = true;
      const result = await handler.handle(
        { type: 'CONNECT' },
        'https://example.com',
        {},
      );
      expect(result).toEqual({ error: 'Wallet is locked' });
    });

    it('should return address for already approved origin', async () => {
      await connectionManager.approveConnection('https://example.com');
      const result = await handler.handle(
        { type: 'CONNECT' },
        'https://example.com',
        {},
      );
      expect(result).toEqual({ address: 'rTestAddress1234567890', approved: true });
    });

    it('should create pending request for unapproved origin', async () => {
      // Fire the handler (it returns a promise that won't resolve until approval)
      handler.handle({ type: 'CONNECT' }, 'https://new-site.com', {});
      // Allow the async isApproved check inside handleConnect to settle
      await new Promise((r) => setTimeout(r, 50));
      const pending = handler.getPendingRequests();
      expect(pending).toHaveLength(1);
      expect(pending[0].type).toBe('connect');
      expect(pending[0].origin).toBe('https://new-site.com');
    });
  });

  describe('SIGN_TRANSACTION message handling', () => {
    it('should return error when wallet is locked', async () => {
      state.isLocked = true;
      const result = await handler.handle(
        { type: 'SIGN_TRANSACTION', payload: { TransactionType: 'Payment' } },
        'https://example.com',
        {},
      );
      expect(result).toEqual({ error: 'Wallet is locked' });
    });

    it('should return error when origin is not authorized', async () => {
      const result = await handler.handle(
        { type: 'SIGN_TRANSACTION', payload: { TransactionType: 'Payment' } },
        'https://unauthorized-site.com',
        {},
      );
      expect(result).toEqual({ error: 'Not authorized for signing. Call connect() first.' });
    });

    it('should create pending sign request for approved origin', async () => {
      await connectionManager.approveConnection('https://example.com');
      handler.handle(
        { type: 'SIGN_TRANSACTION', payload: { TransactionType: 'Payment' } },
        'https://example.com',
        {},
      );
      // Allow the async permission check inside handleSignTransaction to settle
      await new Promise((r) => setTimeout(r, 50));
      const pending = handler.getPendingRequests();
      expect(pending).toHaveLength(1);
      expect(pending[0].type).toBe('sign');
      expect(pending[0].origin).toBe('https://example.com');
    });
  });

  describe('Unknown message type', () => {
    it('should return error for unknown message types', async () => {
      const result = await handler.handle(
        { type: 'INVALID_TYPE' as never },
        'https://example.com',
        {},
      );
      expect(result).toEqual({ error: 'Unknown message type' });
    });
  });

  describe('Origin validation', () => {
    it('should reject GET_ADDRESS from unauthorized origin', async () => {
      const result = await handler.handle(
        { type: 'GET_ADDRESS' },
        'https://evil-site.com',
        {},
      );
      expect(result).toEqual({ error: 'Not authorized. Call connect() first.' });
    });

    it('should allow GET_ADDRESS from approved origin', async () => {
      await connectionManager.approveConnection('https://trusted-site.com');
      const result = await handler.handle(
        { type: 'GET_ADDRESS' },
        'https://trusted-site.com',
        {},
      );
      expect(result).toEqual({ address: 'rTestAddress1234567890' });
    });

    it('should handle disconnect and revoke access', async () => {
      await connectionManager.approveConnection('https://example.com');
      const result = await handler.handle(
        { type: 'DISCONNECT' },
        'https://example.com',
        {},
      );
      expect(result).toEqual({ success: true });

      const isApproved = await connectionManager.isApproved('https://example.com');
      expect(isApproved).toBe(false);
    });
  });

  describe('Wallet lock/unlock', () => {
    it('should lock the wallet', async () => {
      state.isLocked = false;
      const result = await handler.handle({ type: 'LOCK' }, 'popup', {});
      expect(result).toEqual({ success: true });
      expect(state.isLocked).toBe(true);
    });

    it('should unlock the wallet with PIN', async () => {
      state.isLocked = true;
      const result = await handler.handle(
        { type: 'UNLOCK', payload: { pin: '123456' } },
        'popup',
        {},
      );
      expect(result).toEqual({ success: true, address: 'rTestAddress1234567890' });
      expect(state.isLocked).toBe(false);
    });

    it('should reject unlock without PIN', async () => {
      state.isLocked = true;
      const result = await handler.handle(
        { type: 'UNLOCK', payload: { pin: '' } },
        'popup',
        {},
      );
      expect(result).toEqual({ error: 'PIN is required' });
    });
  });
});
