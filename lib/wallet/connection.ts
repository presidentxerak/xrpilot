import { Client } from "xrpl";

export type XrplNetwork = "testnet" | "mainnet";

const NETWORK_NODES: Record<XrplNetwork, string[]> = {
  testnet: [
    "wss://s.altnet.rippletest.net:51233",
    "wss://testnet.xrpl-labs.com",
  ],
  mainnet:
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_XRPL_NODES
      ? process.env.NEXT_PUBLIC_XRPL_NODES.split(",").map((u) => u.trim())
      : ["wss://xrplcluster.com", "wss://s1.ripple.com"],
};

const CONNECTION_TIMEOUT_MS = 10_000;

let activeClient: Client | null = null;
let activeNetwork: XrplNetwork | null = null;

function getDefaultNetwork(): XrplNetwork {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_XRPL_NETWORK === "mainnet") {
    return "mainnet";
  }
  return "testnet";
}

let currentNetwork: XrplNetwork = getDefaultNetwork();

export function getCurrentNetwork(): XrplNetwork {
  return currentNetwork;
}

export async function setNetwork(network: XrplNetwork): Promise<void> {
  if (network === currentNetwork && activeClient?.isConnected()) {
    return;
  }
  currentNetwork = network;
  await disconnect();
}

/**
 * Returns a connected XRPL client for the current network.
 */
export async function getClient(network?: XrplNetwork): Promise<Client> {
  const targetNetwork = network ?? currentNetwork;

  if (activeClient?.isConnected() && activeNetwork === targetNetwork) {
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
    activeNetwork = null;
  }

  const nodes = NETWORK_NODES[targetNetwork];

  for (const node of nodes) {
    const client = new Client(node, {
      connectionTimeout: CONNECTION_TIMEOUT_MS,
    });

    try {
      await client.connect();
      activeClient = client;
      activeNetwork = targetNetwork;

      client.on("disconnected", () => {
        if (activeClient === client) {
          activeClient = null;
          activeNetwork = null;
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
    `Unable to connect to any XRPL ${targetNetwork} node. Please check your network connection.`
  );
}

/**
 * Disconnects the active XRPL client, if any.
 */
export async function disconnect(): Promise<void> {
  if (activeClient) {
    const client = activeClient;
    activeClient = null;
    activeNetwork = null;
    try {
      await client.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
}
