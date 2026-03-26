import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager } from '../src/background/connection-manager';

// Mock chrome.storage.local
const mockStorage: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(async (key: string) => {
        return { [key]: mockStorage[key] };
      }),
      set: vi.fn(async (data: Record<string, unknown>) => {
        Object.assign(mockStorage, data);
      }),
    },
  },
};

vi.stubGlobal('chrome', mockChrome);

describe('ConnectionManager', () => {
  let manager: ConnectionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    manager = new ConnectionManager();
  });

  describe('approveConnection', () => {
    it('should add a connection with default permissions', async () => {
      const connection = await manager.approveConnection('https://example.com');

      expect(connection.origin).toBe('https://example.com');
      expect(connection.approvedAt).toBeGreaterThan(0);
      expect(connection.permissions).toContain('view_address');
      expect(connection.permissions).toContain('sign_transaction');
      expect(connection.permissions).toContain('view_balance');
    });

    it('should add a connection with custom permissions', async () => {
      const connection = await manager.approveConnection('https://example.com', [
        'view_address',
      ]);

      expect(connection.permissions).toEqual(['view_address']);
      expect(connection.permissions).not.toContain('sign_transaction');
    });

    it('should persist the connection to storage', async () => {
      await manager.approveConnection('https://example.com');

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
    });

    it('should overwrite existing connection for same origin', async () => {
      await manager.approveConnection('https://example.com', ['view_address']);
      await manager.approveConnection('https://example.com', [
        'view_address',
        'sign_transaction',
      ]);

      const connections = await manager.getConnections();
      expect(connections).toHaveLength(1);
      expect(connections[0].permissions).toContain('sign_transaction');
    });
  });

  describe('revokeConnection', () => {
    it('should remove an existing connection', async () => {
      await manager.approveConnection('https://example.com');
      const revoked = await manager.revokeConnection('https://example.com');

      expect(revoked).toBe(true);

      const isApproved = await manager.isApproved('https://example.com');
      expect(isApproved).toBe(false);
    });

    it('should return false for non-existent connection', async () => {
      const revoked = await manager.revokeConnection('https://nonexistent.com');
      expect(revoked).toBe(false);
    });

    it('should persist removal to storage', async () => {
      await manager.approveConnection('https://example.com');
      vi.clearAllMocks();
      await manager.revokeConnection('https://example.com');

      expect(mockChrome.storage.local.set).toHaveBeenCalled();
    });
  });

  describe('isApproved', () => {
    it('should return true for approved origin', async () => {
      await manager.approveConnection('https://example.com');
      const result = await manager.isApproved('https://example.com');
      expect(result).toBe(true);
    });

    it('should return false for unapproved origin', async () => {
      const result = await manager.isApproved('https://unknown.com');
      expect(result).toBe(false);
    });

    it('should return false after revoking', async () => {
      await manager.approveConnection('https://example.com');
      await manager.revokeConnection('https://example.com');
      const result = await manager.isApproved('https://example.com');
      expect(result).toBe(false);
    });
  });

  describe('getConnections', () => {
    it('should return empty array when no connections exist', async () => {
      const connections = await manager.getConnections();
      expect(connections).toEqual([]);
    });

    it('should return all approved connections', async () => {
      await manager.approveConnection('https://site-a.com');
      await manager.approveConnection('https://site-b.com');
      await manager.approveConnection('https://site-c.com');

      const connections = await manager.getConnections();
      expect(connections).toHaveLength(3);

      const origins = connections.map((c) => c.origin);
      expect(origins).toContain('https://site-a.com');
      expect(origins).toContain('https://site-b.com');
      expect(origins).toContain('https://site-c.com');
    });

    it('should not include revoked connections', async () => {
      await manager.approveConnection('https://site-a.com');
      await manager.approveConnection('https://site-b.com');
      await manager.revokeConnection('https://site-a.com');

      const connections = await manager.getConnections();
      expect(connections).toHaveLength(1);
      expect(connections[0].origin).toBe('https://site-b.com');
    });
  });

  describe('hasPermission', () => {
    it('should return true when origin has the requested permission', async () => {
      await manager.approveConnection('https://example.com');
      const result = await manager.hasPermission('https://example.com', 'view_address');
      expect(result).toBe(true);
    });

    it('should return false when origin lacks the permission', async () => {
      await manager.approveConnection('https://example.com', ['view_address']);
      const result = await manager.hasPermission('https://example.com', 'sign_transaction');
      expect(result).toBe(false);
    });

    it('should return false for unknown origin', async () => {
      const result = await manager.hasPermission('https://unknown.com', 'view_address');
      expect(result).toBe(false);
    });
  });
});
