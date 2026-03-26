const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12;
const SALT_LENGTH_BYTES = 16;
const TAG_LENGTH_BITS = 128;

/**
 * Derive an AES-256 key from a PIN/password and salt using PBKDF2.
 */
export async function deriveKey(
  pin: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: KEY_LENGTH_BITS,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt plaintext using AES-256-GCM with a PIN-derived key.
 *
 * Returns a base64-encoded bundle: salt (16 B) + iv (12 B) + ciphertext + tag (16 B).
 */
export async function encrypt(data: string, pin: string): Promise<string> {
  const salt = globalThis.crypto.getRandomValues(
    new Uint8Array(SALT_LENGTH_BYTES),
  );
  const iv = globalThis.crypto.getRandomValues(
    new Uint8Array(IV_LENGTH_BYTES),
  );

  const key = await deriveKey(pin, salt);

  const encoder = new TextEncoder();
  const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: TAG_LENGTH_BITS,
    },
    key,
    encoder.encode(data),
  );

  // Combine: salt + iv + ciphertext (which already includes the auth tag)
  const ciphertext = new Uint8Array(ciphertextBuffer);
  const bundle = new Uint8Array(
    salt.length + iv.length + ciphertext.length,
  );
  bundle.set(salt, 0);
  bundle.set(iv, salt.length);
  bundle.set(ciphertext, salt.length + iv.length);

  return uint8ArrayToBase64(bundle);
}

/**
 * Decrypt a base64-encoded AES-256-GCM bundle using the given PIN.
 *
 * Throws if the PIN is incorrect or the data has been tampered with.
 */
export async function decrypt(
  encryptedData: string,
  pin: string,
): Promise<string> {
  const bundle = base64ToUint8Array(encryptedData);

  const salt = bundle.slice(0, SALT_LENGTH_BYTES);
  const iv = bundle.slice(SALT_LENGTH_BYTES, SALT_LENGTH_BYTES + IV_LENGTH_BYTES);
  const ciphertext = bundle.slice(SALT_LENGTH_BYTES + IV_LENGTH_BYTES);

  const key = await deriveKey(pin, salt);

  const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: TAG_LENGTH_BITS,
    },
    key,
    ciphertext,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// ---------------------------------------------------------------------------
// Base64 helpers — work in both browser and Node 20+
// ---------------------------------------------------------------------------

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
