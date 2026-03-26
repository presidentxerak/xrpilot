/** Minimum base reserve for an XRPL account, in drops (10 XRP) */
export const MIN_RESERVE_DROPS = "10000000" as const;

/** Owner reserve per owned object, in drops (2 XRP) */
export const OWNER_RESERVE_DROPS = "2000000" as const;

/** Minimum network transaction fee, in drops */
export const MIN_TRANSACTION_FEE_DROPS = "12" as const;

/** Maximum valid destination tag value (uint32 max) */
export const MAX_DESTINATION_TAG = 4294967295 as const;

/** Number of drops in one XRP */
export const DROPS_PER_XRP = 1_000_000 as const;

/** Maximum XRP supply in drops */
export const MAX_XRP_DROPS = "100000000000000000" as const;

export interface NetworkConfig {
  readonly name: string;
  readonly websocketUrl: string;
  readonly jsonRpcUrl: string;
  readonly explorerUrl: string;
  readonly isTestnet: boolean;
}

export const NETWORKS = {
  mainnet: {
    name: "Mainnet",
    websocketUrl: "wss://xrplcluster.com",
    jsonRpcUrl: "https://xrplcluster.com",
    explorerUrl: "https://livenet.xrpl.org",
    isTestnet: false,
  },
  testnet: {
    name: "Testnet",
    websocketUrl: "wss://s.altnet.rippletest.net:51233",
    jsonRpcUrl: "https://s.altnet.rippletest.net:51234",
    explorerUrl: "https://testnet.xrpl.org",
    isTestnet: true,
  },
  devnet: {
    name: "Devnet",
    websocketUrl: "wss://s.devnet.rippletest.net:51233",
    jsonRpcUrl: "https://s.devnet.rippletest.net:51234",
    explorerUrl: "https://devnet.xrpl.org",
    isTestnet: true,
  },
} as const satisfies Record<string, NetworkConfig>;

export type NetworkName = keyof typeof NETWORKS;
