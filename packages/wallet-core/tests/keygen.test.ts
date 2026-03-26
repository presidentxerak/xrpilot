import { describe, it, expect } from "vitest";
import {
  generateWallet,
  importFromSeed,
  importFromEntropy,
  deriveAddress,
} from "../src/keygen.js";

describe("keygen", () => {
  describe("generateWallet", () => {
    it("returns a complete wallet with address, publicKey, privateKey, and seed", () => {
      const wallet = generateWallet();

      expect(wallet.address).toMatch(/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/);
      expect(wallet.publicKey).toBeTruthy();
      expect(wallet.privateKey).toBeTruthy();
      expect(wallet.seed).toBeTruthy();
    });

    it("generates unique wallets on each call", () => {
      const a = generateWallet();
      const b = generateWallet();

      expect(a.address).not.toBe(b.address);
      expect(a.seed).not.toBe(b.seed);
    });
  });

  describe("importFromSeed", () => {
    it("deterministically recreates the same wallet from a seed", () => {
      const original = generateWallet();
      const imported = importFromSeed(original.seed);

      expect(imported.address).toBe(original.address);
      expect(imported.publicKey).toBe(original.publicKey);
      expect(imported.privateKey).toBe(original.privateKey);
      expect(imported.seed).toBe(original.seed);
    });

    it("throws for an invalid seed", () => {
      expect(() => importFromSeed("not-a-valid-seed")).toThrow();
    });
  });

  describe("importFromEntropy", () => {
    it("creates a wallet from a hex entropy string", () => {
      // 16 bytes of entropy (32 hex chars)
      const entropy = "0123456789abcdef0123456789abcdef";
      const wallet = importFromEntropy(entropy);

      expect(wallet.address).toMatch(/^r/);
      expect(wallet.publicKey).toBeTruthy();
      expect(wallet.seed).toBeTruthy();
    });

    it("produces the same wallet for the same entropy", () => {
      const entropy = "abcdef0123456789abcdef0123456789";
      const a = importFromEntropy(entropy);
      const b = importFromEntropy(entropy);

      expect(a.address).toBe(b.address);
      expect(a.seed).toBe(b.seed);
    });
  });

  describe("deriveAddress", () => {
    it("derives the correct address from a public key", () => {
      const wallet = generateWallet();
      const address = deriveAddress(wallet.publicKey);

      expect(address).toBe(wallet.address);
    });
  });
});
