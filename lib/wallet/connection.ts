import { Client } from "xrpl";

const DEFAULT_NODES = [
  "wss://xrplcluster.com",
  "wss://s1.ripple.com",
];

const CONNECTION_TIMEOUT_MS = 10_000;

let activeClient: Client | null = null;

/**
 * Returns a connected XRPL client. Reuses an existing connection if available.
 * Falls back to secondary nodes if the primary node is unreachable.
 */
export async function getClient(): Promise<Client> {
  if (activeClient?.isConnected()) {
    return activeClient;
  }

  // Clean up any stale client
  if (activeClient) {
    try {
      await activeClient.disconnect();
    } catch {
      // Ignore disconnect errors on stale client
    }
    activeClient = null;
  }

  for (const node of DEFAULT_NODES) {
    const client = new Client(node, {
      connectionTimeout: CONNECTION_TIMEOUT_MS,
    });

    try {
      await client.connect();
      activeClient = client;

      // Handle unexpected disconnections
      client.on("disconnected", () => {
        if (activeClient === client) {
          activeClient = null;
        }
      });

      return client;
    } catch {
      try {
        await client.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  throw new Error(
    "Unable to connect to any XRPL node. Please check your network connection."
  );
}

/**
 * Disconnects the active XRPL client, if any.
 */
export async function disconnect(): Promise<void> {
  if (activeClient) {
    const client = activeClient;
    activeClient = null;
    try {
      await client.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
}
