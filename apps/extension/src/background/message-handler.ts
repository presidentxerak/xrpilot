import { ConnectionManager } from './connection-manager';

export type MessageType =
  | 'CONNECT'
  | 'DISCONNECT'
  | 'GET_ADDRESS'
  | 'SIGN_TRANSACTION'
  | 'GET_NETWORK'
  | 'UNLOCK'
  | 'LOCK'
  | 'GET_STATE'
  | 'APPROVE_REQUEST'
  | 'REJECT_REQUEST'
  | 'SET_NETWORK'
  | 'SET_AUTO_LOCK'
  | 'REVOKE_CONNECTION'
  | 'GET_CONNECTIONS';

export interface Message {
  type: MessageType;
  payload?: unknown;
}

interface WalletState {
  isLocked: boolean;
  address: string | null;
  network: string;
  autoLockTimer: ReturnType<typeof setTimeout> | null;
  autoLockDuration: number;
}

interface PendingRequest {
  id: string;
  type: 'connect' | 'sign';
  origin: string;
  payload?: unknown;
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

export class MessageHandler {
  private connectionManager: ConnectionManager;
  private state: WalletState;
  private pendingRequests: Map<string, PendingRequest> = new Map();

  constructor(connectionManager: ConnectionManager, state: WalletState) {
    this.connectionManager = connectionManager;
    this.state = state;
  }

  async handle(
    message: Message,
    origin: string,
    _sender: chrome.runtime.MessageSender | Record<string, never>,
  ): Promise<unknown> {
    switch (message.type) {
      case 'CONNECT':
        return this.handleConnect(origin);
      case 'DISCONNECT':
        return this.handleDisconnect(origin);
      case 'GET_ADDRESS':
        return this.handleGetAddress(origin);
      case 'SIGN_TRANSACTION':
        return this.handleSignTransaction(origin, message.payload);
      case 'GET_NETWORK':
        return this.handleGetNetwork();
      case 'UNLOCK':
        return this.handleUnlock(message.payload as { pin: string });
      case 'LOCK':
        return this.handleLock();
      case 'GET_STATE':
        return this.handleGetState();
      case 'APPROVE_REQUEST':
        return this.handleApproveRequest(message.payload as { id: string });
      case 'REJECT_REQUEST':
        return this.handleRejectRequest(message.payload as { id: string });
      case 'SET_NETWORK':
        return this.handleSetNetwork(message.payload as { network: string });
      case 'SET_AUTO_LOCK':
        return this.handleSetAutoLock(message.payload as { duration: number });
      case 'REVOKE_CONNECTION':
        return this.handleRevokeConnection(message.payload as { origin: string });
      case 'GET_CONNECTIONS':
        return this.handleGetConnections();
      default:
        return { error: 'Unknown message type' };
    }
  }

  private async handleConnect(origin: string): Promise<unknown> {
    if (this.state.isLocked) {
      return { error: 'Wallet is locked' };
    }

    const isApproved = await this.connectionManager.isApproved(origin);
    if (isApproved) {
      return { address: this.state.address, approved: true };
    }

    // Create a pending approval request
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        id,
        type: 'connect',
        origin,
        resolve,
        reject,
      });

      // Notify popup about pending request
      chrome.runtime.sendMessage({
        type: 'PENDING_REQUEST',
        payload: { id, requestType: 'connect', origin },
      }).catch(() => {
        // Popup may not be open; open it
        chrome.action.openPopup?.().catch(() => {
          // openPopup not available in all contexts
        });
      });
    });
  }

  private async handleDisconnect(origin: string): Promise<unknown> {
    await this.connectionManager.revokeConnection(origin);
    return { success: true };
  }

  private async handleGetAddress(origin: string): Promise<unknown> {
    if (this.state.isLocked) {
      return { error: 'Wallet is locked' };
    }

    const hasPermission = await this.connectionManager.hasPermission(
      origin,
      'view_address',
    );
    if (!hasPermission) {
      return { error: 'Not authorized. Call connect() first.' };
    }

    return { address: this.state.address };
  }

  private async handleSignTransaction(
    origin: string,
    payload: unknown,
  ): Promise<unknown> {
    if (this.state.isLocked) {
      return { error: 'Wallet is locked' };
    }

    const hasPermission = await this.connectionManager.hasPermission(
      origin,
      'sign_transaction',
    );
    if (!hasPermission) {
      return { error: 'Not authorized for signing. Call connect() first.' };
    }

    // Create pending signing request; requires user approval via popup
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        id,
        type: 'sign',
        origin,
        payload,
        resolve,
        reject,
      });

      chrome.runtime.sendMessage({
        type: 'PENDING_REQUEST',
        payload: { id, requestType: 'sign', origin, transaction: payload },
      }).catch(() => {
        chrome.action.openPopup?.().catch(() => {
          // openPopup not available in all contexts
        });
      });
    });
  }

  private handleGetNetwork(): unknown {
    return { network: this.state.network };
  }

  private handleUnlock(payload: { pin: string }): unknown {
    // PIN verification would delegate to @pilot/security in production
    if (!payload?.pin) {
      return { error: 'PIN is required' };
    }
    this.state.isLocked = false;
    return { success: true, address: this.state.address };
  }

  private handleLock(): unknown {
    this.state.isLocked = true;
    if (this.state.autoLockTimer) {
      clearTimeout(this.state.autoLockTimer);
      this.state.autoLockTimer = null;
    }
    return { success: true };
  }

  private handleGetState(): unknown {
    return {
      isLocked: this.state.isLocked,
      address: this.state.address,
      network: this.state.network,
      pendingRequests: Array.from(this.pendingRequests.values()).map((r) => ({
        id: r.id,
        type: r.type,
        origin: r.origin,
        payload: r.payload,
      })),
    };
  }

  private async handleApproveRequest(payload: { id: string }): Promise<unknown> {
    const request = this.pendingRequests.get(payload.id);
    if (!request) {
      return { error: 'Request not found' };
    }

    this.pendingRequests.delete(payload.id);

    if (request.type === 'connect') {
      await this.connectionManager.approveConnection(request.origin);
      request.resolve({ address: this.state.address, approved: true });
    } else if (request.type === 'sign') {
      // In production, actual signing via @pilot/wallet-core
      request.resolve({ signed: true, txHash: 'placeholder_hash' });
    }

    return { success: true };
  }

  private async handleRejectRequest(payload: { id: string }): Promise<unknown> {
    const request = this.pendingRequests.get(payload.id);
    if (!request) {
      return { error: 'Request not found' };
    }

    this.pendingRequests.delete(payload.id);
    request.reject(new Error('User rejected the request'));

    return { success: true };
  }

  private async handleSetNetwork(payload: { network: string }): Promise<unknown> {
    this.state.network = payload.network;
    await chrome.storage.local.set({ network: payload.network });
    return { success: true, network: payload.network };
  }

  private async handleSetAutoLock(payload: { duration: number }): Promise<unknown> {
    this.state.autoLockDuration = payload.duration;
    await chrome.storage.local.set({ autoLockDuration: payload.duration });
    return { success: true };
  }

  private async handleRevokeConnection(payload: { origin: string }): Promise<unknown> {
    const revoked = await this.connectionManager.revokeConnection(payload.origin);
    return { success: revoked };
  }

  private async handleGetConnections(): Promise<unknown> {
    const connections = await this.connectionManager.getConnections();
    return { connections };
  }

  getPendingRequests(): PendingRequest[] {
    return Array.from(this.pendingRequests.values());
  }
}
