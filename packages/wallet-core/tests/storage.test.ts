import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStorageAdapter, WalletStorage } from "../src/storage.js";
import { generateWallet } from "../src/keygen.js";

describe("MemoryStorageAdapter", () => {
  it("returns null for missing keys", async () => {
    const adapter = new MemoryStorageAdapter();
    expect(await adapter.get("nonexistent")).toBeNull();
  });

  it("stores and retrieves values", async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.set("key", "value");
    expect(await adapter.get("key")).toBe("value");
  });

  it("removes keys", async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.set("key", "value");
    await adapter.remove("key");
    expect(await adapter.get("key")).toBeNull();
  });
});

describe("WalletStorage", () => {
  let storage: WalletStorage;
  const pin = "test-pin-123";

  beforeEach(() => {
    storage = new WalletStorage(new MemoryStorageAdapter());
  });

  it("saves and loads a wallet", async () => {
    const keys = generateWallet();

    await storage.saveWallet(
      { address: keys.address, publicKey: keys.publicKey, seed: keys.seed, label: "Main" },
      pin,
    );

    const loaded = await storage.loadWallet(keys.address, pin);

    expect(loaded.address).toBe(keys.address);
    expect(loaded.publicKey).toBe(keys.publicKey);
    expect(loaded.seed).toBe(keys.seed);
    expect(loaded.label).toBe("Main");
    expect(loaded.createdAt).toBeTruthy();
  });

  it("throws when loading a non-existent wallet", async () => {
    await expect(storage.loadWallet("rNonExistent", pin)).rejects.toThrow(
      "Wallet not found",
    );
  });

  it("throws when loading with the wrong PIN", async () => {
    const keys = generateWallet();
    await storage.saveWallet(
      { address: keys.address, publicKey: keys.publicKey, seed: keys.seed, label: "Test" },
      pin,
    );

    await expect(storage.loadWallet(keys.address, "wrong")).rejects.toThrow();
  });

  it("lists all wallets without secrets", async () => {
    const a = generateWallet();
    const b = generateWallet();

    await storage.saveWallet(
      { address: a.address, publicKey: a.publicKey, seed: a.seed, label: "A" },
      pin,
    );
    await storage.saveWallet(
      { address: b.address, publicKey: b.publicKey, seed: b.seed, label: "B" },
      pin,
    );

    const list = await storage.listWallets();

    expect(list).toHaveLength(2);
    expect(list.map((w) => w.address).sort()).toEqual(
      [a.address, b.address].sort(),
    );
    // Ensure no plaintext secrets leak
    for (const w of list) {
      expect((w as Record<string, unknown>)["seed"]).toBeUndefined();
    }
  });

  it("removes a wallet", async () => {
    const keys = generateWallet();
    await storage.saveWallet(
      { address: keys.address, publicKey: keys.publicKey, seed: keys.seed, label: "Temp" },
      pin,
    );

    await storage.removeWallet(keys.address);

    const list = await storage.listWallets();
    expect(list).toHaveLength(0);
  });

  it("exports a wallet seed with correct PIN", async () => {
    const keys = generateWallet();
    await storage.saveWallet(
      { address: keys.address, publicKey: keys.publicKey, seed: keys.seed, label: "Export" },
      pin,
    );

    const seed = await storage.exportWallet(keys.address, pin);
    expect(seed).toBe(keys.seed);
  });

  it("does not duplicate address in list on repeated saves", async () => {
    const keys = generateWallet();
    const data = { address: keys.address, publicKey: keys.publicKey, seed: keys.seed, label: "Dup" };

    await storage.saveWallet(data, pin);
    await storage.saveWallet(data, pin);

    const list = await storage.listWallets();
    expect(list).toHaveLength(1);
  });
});
