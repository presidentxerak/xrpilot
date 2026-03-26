import { Client } from "xrpl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NodeConfig {
  /** WebSocket URL of the XRPL node (e.g. wss://xrplcluster.com) */
  readonly url: string;
  /** Lower number = higher priority. Primary node should be 0. */
  readonly priority: number;
}

export interface ConnectionEvents {
  onDisconnect?: (code: number) => void;
  onReconnect?: () => void;
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Default nodes
// ---------------------------------------------------------------------------

export const MAINNET_NODES: readonly NodeConfig[] = [
  { url: "wss://xrplcluster.com", priority: 0 },
  { url: "wss://s1.ripple.com", priority: 1 },
  { url: "wss://s2.ripple.com", priority: 2 },
] as const;

export const TESTNET_NODES: readonly NodeConfig[] = [
  { url: "wss://s.altnet.rippletest.net:51233", priority: 0 },
  { url: "wss://testnet.xrpl-labs.com", priority: 1 },
] as const;

// ---------------------------------------------------------------------------
// Connection manager
// ---------------------------------------------------------------------------

const HEALTH_CHECK_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 2_000;
const MAX_RECONNECT_ATTEMPTS = 5;

export class XrplConnectionManager {
  private readonly nodes: NodeConfig[];
  private client: Client | null = null;
  private activeNodeUrl: string | null = null;
  private healthTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private events: ConnectionEvents = {};
  private disposed = false;

  constructor(nodes: NodeConfig[], events?: ConnectionEvents) {
    if (nodes.length === 0) {
      throw new Error("At least one node must be provided");
    }
    // Sort by priority (lowest number first)
    this.nodes = [...nodes].sort((a, b) => a.priority - b.priority);
    if (events) {
      this.events = events;
    }
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Connect to the best available node, falling back through the list. */
  async connect(): Promise<void> {
    if (this.disposed) {
      throw new Error("Connection manager has been disposed");
    }

    for (const node of this.nodes) {
      try {
        await this.connectToNode(node.url);
        this.reconnectAttempts = 0;
        this.startHealthMonitor();
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.warn(
          `Failed to connect to ${node.url}: ${message}. Trying next node...`,
        );
      }
    }

    throw new Error(
      "Unable to connect to any XRPL node. Please check your network connection and try again.",
    );
  }

  /** Gracefully disconnect from the current node and stop health monitoring. */
  async disconnect(): Promise<void> {
    this.disposed = true;
    this.stopHealthMonitor();

    if (this.client?.isConnected()) {
      try {
        await this.client.disconnect();
      } catch {
        // swallow — we are tearing down
      }
    }
    this.client = null;
    this.activeNodeUrl = null;
  }

  /** Returns the active xrpl.Client. Throws if not connected. */
  getClient(): Client {
    if (!this.client || !this.client.isConnected()) {
      throw new Error(
        "Not connected to any XRPL node. Call connect() first.",
      );
    }
    return this.client;
  }

  /** Whether the underlying client is currently connected. */
  isConnected(): boolean {
    return this.client?.isConnected() === true;
  }

  /** URL of the node we are currently connected to, or null. */
  getActiveNodeUrl(): string | null {
    return this.activeNodeUrl;
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private async connectToNode(url: string): Promise<void> {
    const client = new Client(url);

    client.on("disconnected", (code: number) => {
      this.events.onDisconnect?.(code);
      void this.handleDisconnect();
    });

    client.on("error", (_errorCode: string, errorMessage: string) => {
      this.events.onError?.(new Error(errorMessage));
    });

    await client.connect();
    this.client = client;
    this.activeNodeUrl = url;
  }

  private async handleDisconnect(): Promise<void> {
    if (this.disposed) return;

    this.stopHealthMonitor();

    while (
      this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS &&
      !this.disposed
    ) {
      this.reconnectAttempts++;
      const delay = RECONNECT_DELAY_MS * this.reconnectAttempts;
      await this.sleep(delay);

      try {
        await this.connect();
        this.events.onReconnect?.();
        return;
      } catch {
        console.warn(
          `Reconnect attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} failed.`,
        );
      }
    }

    this.events.onError?.(
      new Error(
        "Maximum reconnect attempts reached. Please reconnect manually.",
      ),
    );
  }

  private startHealthMonitor(): void {
    this.stopHealthMonitor();
    this.healthTimer = setInterval(() => {
      void this.ping();
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private stopHealthMonitor(): void {
    if (this.healthTimer !== null) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }

  private async ping(): Promise<void> {
    if (!this.client || !this.client.isConnected()) return;
    try {
      await this.client.request({ command: "ping" });
    } catch {
      console.warn("Health check ping failed — triggering reconnect.");
      void this.handleDisconnect();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
