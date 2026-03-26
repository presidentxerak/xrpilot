/**
 * Biometric authentication via WebAuthn / platform authenticator.
 *
 * Falls back gracefully to PIN when biometrics are unavailable.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BiometricStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface BiometricResult {
  readonly success: boolean;
  readonly method: "biometric" | "pin_fallback";
  readonly credentialId?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORE_KEY_CREDENTIAL_ID = "biometric:credentialId";
const STORE_KEY_ENROLLED = "biometric:enrolled";
const RP_NAME = "Pilot Wallet";
const RP_ID_FALLBACK = "localhost";

// ---------------------------------------------------------------------------
// BiometricAuth
// ---------------------------------------------------------------------------

export class BiometricAuth {
  private readonly store: BiometricStore;
  private readonly rpId: string;

  constructor(store: BiometricStore, rpId?: string) {
    this.store = store;
    this.rpId = rpId ?? (typeof location !== "undefined" ? location.hostname : RP_ID_FALLBACK);
  }

  /**
   * Check whether the platform supports biometric / platform authenticators.
   */
  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      return false;
    }

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Check whether the user has enrolled biometric authentication.
   */
  async isEnrolled(): Promise<boolean> {
    const enrolled = await this.store.get(STORE_KEY_ENROLLED);
    return enrolled === "true";
  }

  /**
   * Enroll biometric authentication by creating a platform credential.
   *
   * Throws if biometrics are not available on this device.
   */
  async enroll(): Promise<BiometricResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new BiometricsUnavailableError();
    }

    const userId = crypto.getRandomValues(new Uint8Array(16));
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = (await navigator.credentials.create({
      publicKey: {
        rp: {
          name: RP_NAME,
          id: this.rpId,
        },
        user: {
          id: userId,
          name: "pilot-wallet-user",
          displayName: "Pilot Wallet User",
        },
        challenge,
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60_000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new BiometricEnrollmentFailedError();
    }

    const credentialId = bufferToBase64Url(credential.rawId);
    await this.store.set(STORE_KEY_CREDENTIAL_ID, credentialId);
    await this.store.set(STORE_KEY_ENROLLED, "true");

    return {
      success: true,
      method: "biometric",
      credentialId,
    };
  }

  /**
   * Authenticate using a previously enrolled biometric credential.
   *
   * Returns a fallback result when biometrics are unavailable so the caller
   * can prompt for PIN instead.
   */
  async authenticate(): Promise<BiometricResult> {
    const enrolled = await this.isEnrolled();
    if (!enrolled) {
      return { success: false, method: "pin_fallback" };
    }

    const available = await this.isAvailable();
    if (!available) {
      return { success: false, method: "pin_fallback" };
    }

    const storedCredentialId = await this.store.get(STORE_KEY_CREDENTIAL_ID);
    if (!storedCredentialId) {
      return { success: false, method: "pin_fallback" };
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));

    try {
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              id: base64UrlToBuffer(storedCredentialId),
              type: "public-key",
              transports: ["internal"],
            },
          ],
          userVerification: "required",
          timeout: 60_000,
          rpId: this.rpId,
        },
      })) as PublicKeyCredential | null;

      if (!assertion) {
        return { success: false, method: "pin_fallback" };
      }

      return {
        success: true,
        method: "biometric",
        credentialId: storedCredentialId,
      };
    } catch {
      // User cancelled or authenticator error -- fall back to PIN.
      return { success: false, method: "pin_fallback" };
    }
  }

  /**
   * Remove the enrolled biometric credential.
   */
  async unenroll(): Promise<void> {
    await this.store.delete(STORE_KEY_CREDENTIAL_ID);
    await this.store.delete(STORE_KEY_ENROLLED);
  }
}

// ---------------------------------------------------------------------------
// Encoding helpers
// ---------------------------------------------------------------------------

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class BiometricsUnavailableError extends Error {
  constructor() {
    super("Platform biometric authenticator is not available");
    this.name = "BiometricsUnavailableError";
  }
}

export class BiometricEnrollmentFailedError extends Error {
  constructor() {
    super("Biometric enrollment failed or was cancelled");
    this.name = "BiometricEnrollmentFailedError";
  }
}
