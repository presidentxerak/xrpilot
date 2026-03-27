import { getClient, getCurrentNetwork } from "@/lib/wallet/connection";
import type { XrplNetwork } from "@/lib/wallet/connection";

/**
 * Funds a wallet on testnet using the XRPL faucet.
 * Returns the funded balance in drops, or throws if funding fails.
 */
export async function fundTestnetWallet(address: string): Promise<string> {
  const client = await getClient("testnet");

  const response = await fetch("https://faucet.altnet.rippletest.net/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination: address }),
  });

  if (!response.ok) {
    throw new Error(`Faucet request failed: ${response.status}`);
  }

  // Wait for the account to appear on ledger
  let retries = 10;
  while (retries > 0) {
    try {
      const info = await client.request({
        command: "account_info",
        account: address,
        ledger_index: "validated",
      });
      return info.result.account_data.Balance as string;
    } catch {
      retries--;
      if (retries === 0) {
        throw new Error("Account funded but not yet visible on ledger. Please refresh.");
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return "0";
}

/**
 * Activates a wallet on mainnet via the sponsoring API route.
 */
export async function activateMainnetWallet(address: string): Promise<{ hash: string; amount: string }> {
  const response = await fetch("/api/wallet/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Activation failed" }));
    throw new Error(error.error || "Failed to activate wallet");
  }

  return response.json();
}

/**
 * Funds/activates a wallet based on the current network.
 */
export async function fundWallet(
  address: string,
  network?: XrplNetwork
): Promise<{ balance: string }> {
  const net = network ?? getCurrentNetwork();

  if (net === "testnet") {
    const balance = await fundTestnetWallet(address);
    return { balance };
  }

  const result = await activateMainnetWallet(address);
  return { balance: result.amount };
}
