import { describe, it, expect, beforeEach } from "vitest";
import { AccountManager } from "../src/account.js";
import { MemoryStorageAdapter } from "../src/storage.js";
import { generateWallet } from "../src/keygen.js";

describe("AccountManager", () => {
  let manager: AccountManager;
  const pin = "secure-pin-456";

  beforeEach(() => {
    manager = new AccountManager(new MemoryStorageAdapter());
  });

  describe("createAccount", () => {
    it("creates an account and returns public metadata", async () => {
      const account = await manager.createAccount("My Wallet", pin);

      expect(account.address).toMatch(/^r/);
      expect(account.publicKey).toBeTruthy();
      expect(account.label).toBe("My Wallet");
      expect(account.createdAt).toBeTruthy();
      // Must not leak the seed
      expect((account as Record<string, unknown>)["seed"]).toBeUndefined();
    });
  });

  describe("importAccount", () => {
    it("imports an existing wallet by seed", async () => {
      const keys = generateWallet();
      const account = await manager.importAccount(keys.seed, "Imported", pin);

      expect(account.address).toBe(keys.address);
      expect(account.label).toBe("Imported");
    });
  });

  describe("getAccount", () => {
    it("returns the account for a known address", async () => {
      const created = await manager.createAccount("Test", pin);
      const found = await manager.getAccount(created.address);

      expect(found).not.toBeNull();
      expect(found!.address).toBe(created.address);
    });

    it("returns null for an unknown address", async () => {
      const found = await manager.getAccount("rUnknownAddress123");
      expect(found).toBeNull();
    });
  });

  describe("listAccounts", () => {
    it("returns all created accounts", async () => {
      await manager.createAccount("A", pin);
      await manager.createAccount("B", pin);
      await manager.createAccount("C", pin);

      const list = await manager.listAccounts();
      expect(list).toHaveLength(3);
    });
  });

  describe("setActiveAccount", () => {
    it("sets and retrieves the active account", async () => {
      const account = await manager.createAccount("Active", pin);
      await manager.setActiveAccount(account.address);

      const active = await manager.getActiveAccount();
      expect(active).toBe(account.address);
    });

    it("throws if the address does not exist", async () => {
      await expect(
        manager.setActiveAccount("rNonExistent"),
      ).rejects.toThrow("Account not found");
    });
  });

  describe("removeAccount", () => {
    it("removes an account with the correct PIN", async () => {
      const account = await manager.createAccount("ToRemove", pin);
      await manager.removeAccount(account.address, pin);

      const list = await manager.listAccounts();
      expect(list).toHaveLength(0);
    });

    it("clears active account pointer when the active account is removed", async () => {
      const account = await manager.createAccount("Active", pin);
      await manager.setActiveAccount(account.address);
      await manager.removeAccount(account.address, pin);

      const active = await manager.getActiveAccount();
      expect(active).toBeNull();
    });

    it("rejects removal with the wrong PIN", async () => {
      const account = await manager.createAccount("Protected", pin);

      await expect(
        manager.removeAccount(account.address, "wrong-pin"),
      ).rejects.toThrow();
    });
  });
});
