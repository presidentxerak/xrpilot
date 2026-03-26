const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

function getSubtle(): SubtleCrypto {
  if (typeof globalThis.crypto?.subtle === "undefined") {
    throw new Error("Web Crypto API is not available in this environment.");
  }
  return globalThis.crypto.subtle;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveKey(
  pin: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const subtle = getSubtle();

  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(data: string, pin: string): Promise<string> {
  const subtle = getSubtle();
  const encoder = new TextEncoder();

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(pin, salt);

  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );

  const saltB64 = toBase64(salt.buffer);
  const ivB64 = toBase64(iv.buffer);
  const ciphertextB64 = toBase64(ciphertext);

  return JSON.stringify({ salt: saltB64, iv: ivB64, data: ciphertextB64 });
}

export async function decrypt(
  encryptedData: string,
  pin: string
): Promise<string> {
  const subtle = getSubtle();

  let parsed: { salt: string; iv: string; data: string };
  try {
    parsed = JSON.parse(encryptedData);
  } catch {
    throw new Error("Invalid encrypted data format.");
  }

  const salt = fromBase64(parsed.salt);
  const iv = fromBase64(parsed.iv);
  const ciphertext = fromBase64(parsed.data);

  const key = await deriveKey(pin, salt);

  let plaintext: ArrayBuffer;
  try {
    plaintext = await subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      ciphertext as unknown as BufferSource
    );
  } catch {
    throw new Error("Decryption failed. Incorrect PIN or corrupted data.");
  }

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}
