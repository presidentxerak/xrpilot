/**
 * Secure storage abstraction using AES-256-GCM encryption via Web Crypto.
 *
 * All sensitive values are encrypted before being persisted. Keys are derived
 * from the user's PIN using PBKDF2, ensuring data-at-rest protection.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StorageBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface EncryptedEnvelope {
  /** Base64-encoded ciphertext */
  readonly ct: string;
  /** Base64-encoded IV (12 bytes) */
  readonly iv: string;
  /** Base64-encoded PBKDF2 salt (32 bytes) */
  readonly salt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 32;
const IV_BYTES = 12; // 96-bit IV for AES-GCM
const KEY_BITS = 256;
const PREFIX = "ss:"; // namespace prefix in storage backend

// ---------------------------------------------------------------------------
// SecureStorage
// ---------------------------------------------------------------------------

export class SecureStorage {
  private readonly backend: StorageBackend;

  constructor(backend: StorageBackend) {
    this.backend = backend;
  }

  /**
   * Encrypt `value` with a key derived from `pin` and store it.
   */
  async storeSecret(key: string, value: string, pin: string): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const cryptoKey = await this.deriveKey(pin, salt);

    const encoder = new TextEncoder();
    const plaintext = encoder.encode(value);

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      plaintext,
    );

    const envelope: EncryptedEnvelope = {
      ct: bufferToBase64(ciphertext),
      iv: bufferToBase64(iv.buffer as ArrayBuffer),
      salt: bufferToBase64(salt.buffer as ArrayBuffer),
    };

    await this.backend.set(PREFIX + key, JSON.stringify(envelope));

    // Best-effort memory clearing of the plaintext buffer.
    clearBuffer(plaintext);
  }

  /**
   * Retrieve and decrypt a stored secret using the PIN.
   *
   * Returns `null` if the key does not exist. Throws on incorrect PIN
   * (decryption failure).
   */
  async retrieveSecret(key: string, pin: string): Promise<string | null> {
    const raw = await this.backend.get(PREFIX + key);
    if (raw === null) return null;

    let envelope: EncryptedEnvelope;
    try {
      envelope = JSON.parse(raw) as EncryptedEnvelope;
    } catch {
      throw new SecureStorageCorruptError(key);
    }

    const salt = base64ToBuffer(envelope.salt);
    const iv = base64ToBuffer(envelope.iv);
    const ciphertext = base64ToBuffer(envelope.ct);
    const cryptoKey = await this.deriveKey(pin, new Uint8Array(salt));

    let plaintext: ArrayBuffer;
    try {
      plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        ciphertext,
      );
    } catch {
      throw new SecureStorageDecryptError(key);
    }

    const decoder = new TextDecoder();
    const value = decoder.decode(plaintext);

    // Best-effort memory clearing.
    clearBuffer(new Uint8Array(plaintext));

    return value;
  }

  /**
   * Delete a secret from storage.
   */
  async deleteSecret(key: string): Promise<void> {
    await this.backend.delete(PREFIX + key);
  }

  /**
   * Check whether a secret exists (without decrypting).
   */
  async hasSecret(key: string): Promise<boolean> {
    const raw = await this.backend.get(PREFIX + key);
    return raw !== null;
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private async deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(pin),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: KEY_BITS },
      false,
      ["encrypt", "decrypt"],
    );
  }
}

// ---------------------------------------------------------------------------
// Encoding helpers
// ---------------------------------------------------------------------------

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

// ---------------------------------------------------------------------------
// Memory clearing (best effort)
// ---------------------------------------------------------------------------

/**
 * Overwrite a Uint8Array with zeros. JavaScript does not guarantee memory
 * clearing, but this reduces the window during which sensitive data is
 * resident in the heap.
 */
function clearBuffer(buffer: Uint8Array): void {
  buffer.fill(0);
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class SecureStorageDecryptError extends Error {
  constructor(key: string) {
    super(`Failed to decrypt secret "${key}". Incorrect PIN or corrupted data.`);
    this.name = "SecureStorageDecryptError";
  }
}

export class SecureStorageCorruptError extends Error {
  constructor(key: string) {
    super(`Stored data for "${key}" is corrupted and could not be parsed.`);
    this.name = "SecureStorageCorruptError";
  }
}
