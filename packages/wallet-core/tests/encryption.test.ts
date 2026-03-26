import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../src/encryption.js";

describe("encryption", () => {
  const pin = "123456";

  it("round-trips plaintext through encrypt then decrypt", async () => {
    const plaintext = "sEdV1wMrDBhbq3FECjW3pxqNiNj";
    const ciphertext = await encrypt(plaintext, pin);
    const result = await decrypt(ciphertext, pin);

    expect(result).toBe(plaintext);
  });

  it("produces different ciphertext for the same input (random salt/IV)", async () => {
    const plaintext = "test-secret";
    const a = await encrypt(plaintext, pin);
    const b = await encrypt(plaintext, pin);

    expect(a).not.toBe(b);
  });

  it("fails to decrypt with the wrong PIN", async () => {
    const ciphertext = await encrypt("secret-data", pin);

    await expect(decrypt(ciphertext, "wrong-pin")).rejects.toThrow();
  });

  it("handles empty strings", async () => {
    const ciphertext = await encrypt("", pin);
    const result = await decrypt(ciphertext, pin);

    expect(result).toBe("");
  });

  it("handles unicode content", async () => {
    const plaintext = "Hello \u{1F30D} \u00E9\u00E0\u00FC \u4F60\u597D";
    const ciphertext = await encrypt(plaintext, pin);
    const result = await decrypt(ciphertext, pin);

    expect(result).toBe(plaintext);
  });

  it("fails on tampered ciphertext", async () => {
    const ciphertext = await encrypt("important", pin);
    // Flip a character in the middle of the base64 payload
    const tampered =
      ciphertext.slice(0, 40) + "X" + ciphertext.slice(41);

    await expect(decrypt(tampered, pin)).rejects.toThrow();
  });
});
