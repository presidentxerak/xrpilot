import { NextResponse } from "next/server";
import { Client, Wallet, xrpToDrops } from "xrpl";
import type { Payment } from "xrpl";

const SPONSOR_SEED = process.env.XRPL_SPONSOR_SEED;
const ACTIVATION_AMOUNT_XRP = "2"; // 1 XRP reserve + 1 XRP to use
const MAINNET_NODE = process.env.XRPL_MAINNET_NODE ?? "wss://xrplcluster.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string" || !address.startsWith("r")) {
      return NextResponse.json(
        { error: "Invalid XRPL address" },
        { status: 400 }
      );
    }

    if (!SPONSOR_SEED) {
      return NextResponse.json(
        { error: "Wallet sponsoring is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const client = new Client(MAINNET_NODE, { connectionTimeout: 10_000 });

    try {
      await client.connect();

      // Check if account is already activated
      try {
        await client.request({
          command: "account_info",
          account: address,
          ledger_index: "validated",
        });
        return NextResponse.json(
          { error: "Account is already activated" },
          { status: 409 }
        );
      } catch {
        // Account not found = not activated yet, proceed
      }

      const sponsorWallet = Wallet.fromSeed(SPONSOR_SEED);

      const payment: Payment = {
        TransactionType: "Payment",
        Account: sponsorWallet.classicAddress,
        Destination: address,
        Amount: xrpToDrops(ACTIVATION_AMOUNT_XRP),
      };

      const prepared = await client.autofill(payment);
      const signed = sponsorWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const meta = result.result.meta;
      const resultCode =
        typeof meta === "object" && meta !== null && "TransactionResult" in meta
          ? (meta as { TransactionResult: string }).TransactionResult
          : "unknown";

      if (resultCode !== "tesSUCCESS") {
        return NextResponse.json(
          { error: `Activation failed: ${resultCode}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        hash: result.result.hash,
        amount: xrpToDrops(ACTIVATION_AMOUNT_XRP),
        message: "Account activated successfully",
      });
    } finally {
      try {
        await client.disconnect();
      } catch {
        // Ignore
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
