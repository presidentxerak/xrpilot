/**
 * PIN management with PBKDF2 hashing and progressive lockout.
 *
 * All cryptographic operations use the Web Crypto API exclusively.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PinHash {
  readonly hash: string; // hex-encoded
  readonly salt: string; // hex-encoded
}

export interface LockoutState {
  readonly locked: boolean;
  readonly remainingMs: number;
  readonly failedAttempts: number;
  readonly wipeRecommended: boolean;
}

export interface PinStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 32;
const KEY_BYTES = 32; // 256-bit derived key
const MIN_PIN_LENGTH = 6;

const LOCKOUT_TIERS: readonly { readonly maxAttempts: number; readonly durationMs: number }[] = [
  { maxAttempts: 3, durationMs: 30_000 },
  { maxAttempts: 5, durationMs: 300_000 },
  { maxAttempts: 10, durationMs: -1 }, // -1 signals wipe recommendation
];

const STORE_KEY_HASH = "pin:hash";
const STORE_KEY_SALT = "pin:salt";
const STORE_KEY_ATTEMPTS = "pin:failedAttempts";
const STORE_KEY_LOCKOUT_UNTIL = "pin:lockoutUntil";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

function isDigitsOnly(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Derive a 256-bit key from a PIN using PBKDF2-SHA-256 via Web Crypto.
 */
export async function hashPin(pin: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_BYTES * 8,
  );
}

// ---------------------------------------------------------------------------
// PinManager
// ---------------------------------------------------------------------------

export class PinManager {
  private readonly store: PinStore;

  constructor(store: PinStore) {
    this.store = store;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Set up a new PIN. The PIN must be at least 6 digits.
   */
  async setup(pin: string): Promise<void> {
    this.validatePinStrength(pin);

    const salt = generateSalt();
    const hash = await hashPin(pin, salt);

    await this.store.set(STORE_KEY_HASH, toHex(hash));
    await this.store.set(STORE_KEY_SALT, toHex(salt.buffer as ArrayBuffer));
    await this.store.set(STORE_KEY_ATTEMPTS, "0");
    await this.store.delete(STORE_KEY_LOCKOUT_UNTIL);
  }

  /**
   * Verify a PIN against the stored hash. Returns `true` on success.
   *
   * Increments the failed-attempt counter and enforces lockout on failure.
   */
  async verify(pin: string): Promise<boolean> {
    const lockout = await this.getLockoutState();
    if (lockout.locked) {
      throw new PinLockedError(lockout);
    }

    const storedHash = await this.store.get(STORE_KEY_HASH);
    const storedSalt = await this.store.get(STORE_KEY_SALT);

    if (!storedHash || !storedSalt) {
      throw new PinNotSetupError();
    }

    const salt = fromHex(storedSalt);
    const hash = await hashPin(pin, salt);
    const hashHex = toHex(hash);

    if (timingSafeEqual(hashHex, storedHash)) {
      // Reset failed attempts on success.
      await this.store.set(STORE_KEY_ATTEMPTS, "0");
      await this.store.delete(STORE_KEY_LOCKOUT_UNTIL);
      return true;
    }

    await this.recordFailedAttempt();
    return false;
  }

  /**
   * Change the PIN. Requires the current PIN for authorization.
   */
  async change(oldPin: string, newPin: string): Promise<void> {
    const valid = await this.verify(oldPin);
    if (!valid) {
      throw new PinIncorrectError();
    }

    this.validatePinStrength(newPin);

    const salt = generateSalt();
    const hash = await hashPin(newPin, salt);

    await this.store.set(STORE_KEY_HASH, toHex(hash));
    await this.store.set(STORE_KEY_SALT, toHex(salt.buffer as ArrayBuffer));
  }

  /**
   * Return the current number of consecutive failed attempts.
   */
  async getAttempts(): Promise<number> {
    const raw = await this.store.get(STORE_KEY_ATTEMPTS);
    return raw ? parseInt(raw, 10) : 0;
  }

  /**
   * Return the current lockout state.
   */
  async getLockoutState(): Promise<LockoutState> {
    const attempts = await this.getAttempts();
    const lockoutUntilRaw = await this.store.get(STORE_KEY_LOCKOUT_UNTIL);
    const lockoutUntil = lockoutUntilRaw ? parseInt(lockoutUntilRaw, 10) : 0;
    const now = Date.now();

    const wipeRecommended = attempts >= LOCKOUT_TIERS[LOCKOUT_TIERS.length - 1].maxAttempts;

    if (lockoutUntil > now) {
      return {
        locked: true,
        remainingMs: lockoutUntil - now,
        failedAttempts: attempts,
        wipeRecommended,
      };
    }

    return {
      locked: false,
      remainingMs: 0,
      failedAttempts: attempts,
      wipeRecommended,
    };
  }

  /**
   * Check if a PIN has been set up.
   */
  async isSetup(): Promise<boolean> {
    const hash = await this.store.get(STORE_KEY_HASH);
    return hash !== null;
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private validatePinStrength(pin: string): void {
    if (pin.length < MIN_PIN_LENGTH) {
      throw new PinTooShortError(MIN_PIN_LENGTH);
    }
    if (!isDigitsOnly(pin)) {
      throw new PinInvalidFormatError();
    }
  }

  private async recordFailedAttempt(): Promise<void> {
    const attempts = (await this.getAttempts()) + 1;
    await this.store.set(STORE_KEY_ATTEMPTS, String(attempts));

    for (const tier of LOCKOUT_TIERS) {
      if (attempts >= tier.maxAttempts) {
        if (tier.durationMs === -1) {
          // Wipe tier: keep the lockout indefinitely until explicit reset.
          await this.store.set(STORE_KEY_LOCKOUT_UNTIL, String(Date.now() + 86_400_000));
        } else {
          await this.store.set(STORE_KEY_LOCKOUT_UNTIL, String(Date.now() + tier.durationMs));
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Constant-time comparison (best effort in JS)
// ---------------------------------------------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class PinLockedError extends Error {
  readonly lockout: LockoutState;
  constructor(lockout: LockoutState) {
    super(
      lockout.wipeRecommended
        ? "PIN locked: too many failed attempts. Wipe recommended."
        : `PIN locked for ${Math.ceil(lockout.remainingMs / 1000)}s`,
    );
    this.name = "PinLockedError";
    this.lockout = lockout;
  }
}

export class PinNotSetupError extends Error {
  constructor() {
    super("PIN has not been set up");
    this.name = "PinNotSetupError";
  }
}

export class PinIncorrectError extends Error {
  constructor() {
    super("PIN is incorrect");
    this.name = "PinIncorrectError";
  }
}

export class PinTooShortError extends Error {
  constructor(minLength: number) {
    super(`PIN must be at least ${minLength} digits`);
    this.name = "PinTooShortError";
  }
}

export class PinInvalidFormatError extends Error {
  constructor() {
    super("PIN must contain only digits");
    this.name = "PinInvalidFormatError";
  }
}
