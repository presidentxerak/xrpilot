export interface Connection {
  origin: string;
  approvedAt: number;
  permissions: ConnectionPermission[];
}

export type ConnectionPermission = 'view_address' | 'sign_transaction' | 'view_balance';

const DEFAULT_PERMISSIONS: ConnectionPermission[] = [
  'view_address',
  'sign_transaction',
  'view_balance',
];

const STORAGE_KEY = 'pilot_connections';

export class ConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private initialized = false;

  private async ensureLoaded(): Promise<void> {
    if (this.initialized) return;

    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const entries = stored[STORAGE_KEY] as Array<[string, Connection]> | undefined;
    if (entries) {
      this.connections = new Map(entries);
    }
    this.initialized = true;
  }

  private async persist(): Promise<void> {
    const entries = Array.from(this.connections.entries());
    await chrome.storage.local.set({ [STORAGE_KEY]: entries });
  }

  async approveConnection(
    origin: string,
    permissions: ConnectionPermission[] = DEFAULT_PERMISSIONS,
  ): Promise<Connection> {
    await this.ensureLoaded();

    const connection: Connection = {
      origin,
      approvedAt: Date.now(),
      permissions,
    };

    this.connections.set(origin, connection);
    await this.persist();

    return connection;
  }

  async revokeConnection(origin: string): Promise<boolean> {
    await this.ensureLoaded();

    const existed = this.connections.delete(origin);
    if (existed) {
      await this.persist();
    }

    return existed;
  }

  async isApproved(origin: string): Promise<boolean> {
    await this.ensureLoaded();
    return this.connections.has(origin);
  }

  async hasPermission(
    origin: string,
    permission: ConnectionPermission,
  ): Promise<boolean> {
    await this.ensureLoaded();
    const connection = this.connections.get(origin);
    return connection?.permissions.includes(permission) ?? false;
  }

  async getConnection(origin: string): Promise<Connection | undefined> {
    await this.ensureLoaded();
    return this.connections.get(origin);
  }

  async getConnections(): Promise<Connection[]> {
    await this.ensureLoaded();
    return Array.from(this.connections.values());
  }
}
