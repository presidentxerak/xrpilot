/**
 * Privacy utilities for Pilot analytics.
 *
 * All analytics data passes through these helpers before leaving the device.
 * The guiding principle is privacy-first: when in doubt, strip it out.
 */

// ---------------------------------------------------------------------------
// Address anonymization
// ---------------------------------------------------------------------------

/**
 * Deterministically anonymize an XRPL address using a simple hash so that
 * the same address always maps to the same opaque identifier, but the
 * original address cannot be recovered.
 *
 * Uses a basic FNV-1a-inspired hash that works in every JS environment
 * (no Web Crypto dependency required).
 */
export function anonymizeAddress(address: string): string {
  let hash = 0x811c9dc5; // FNV offset basis (32-bit)
  for (let i = 0; i < address.length; i++) {
    hash ^= address.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  // Convert to unsigned 32-bit hex string prefixed with "anon_"
  return `anon_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

// ---------------------------------------------------------------------------
// PII detection & stripping
// ---------------------------------------------------------------------------

/**
 * Patterns that strongly suggest PII. Any property whose *key* or *value*
 * matches one of these is removed before the event leaves the device.
 */
const PII_KEY_PATTERNS: RegExp[] = [
  /secret/i,
  /private[_-]?key/i,
  /seed/i,
  /mnemonic/i,
  /password/i,
  /pin/i,
  /email/i,
  /phone/i,
  /name/i,
  /address(?!_hash)/i, // "address" alone is PII; "address_hash" is fine
  /ssn/i,
  /passport/i,
  /credential/i,
  /token/i,
  /auth/i,
];

/** Matches strings that look like full XRPL classic addresses (r...). */
const XRPL_ADDRESS_RE = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

/** Matches strings that look like email addresses. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strip any property that looks like it could contain PII.
 *
 * Returns a new object — the original is never mutated.
 */
export function sanitizeProperties(
  props: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(props)) {
    // Drop keys that match PII patterns
    if (PII_KEY_PATTERNS.some((re) => re.test(key))) {
      continue;
    }

    // Drop string values that look like raw addresses or emails
    if (typeof value === 'string') {
      if (XRPL_ADDRESS_RE.test(value) || EMAIL_RE.test(value)) {
        continue;
      }
    }

    clean[key] = value;
  }

  return clean;
}

// ---------------------------------------------------------------------------
// Do Not Track / consent
// ---------------------------------------------------------------------------

/**
 * Check whether analytics tracking is allowed based on:
 *   1. The Do Not Track (DNT) header / navigator flag
 *   2. The Global Privacy Control (GPC) signal
 *   3. An explicit user preference stored in localStorage
 *
 * Returns `true` only when all signals permit tracking.
 */
export function isTrackingAllowed(): boolean {
  // Server-side / non-browser environments: default to disallowed
  if (typeof globalThis.navigator === 'undefined') {
    return false;
  }

  const nav = globalThis.navigator as Navigator & {
    doNotTrack?: string;
    globalPrivacyControl?: boolean;
  };

  // Respect Do Not Track
  if (nav.doNotTrack === '1') {
    return false;
  }

  // Respect Global Privacy Control
  if (nav.globalPrivacyControl === true) {
    return false;
  }

  // Check explicit user preference (localStorage may not exist everywhere)
  try {
    const preference = globalThis.localStorage?.getItem(
      'pilot_analytics_consent',
    );
    if (preference === 'denied') {
      return false;
    }
  } catch {
    // localStorage not available — treat as disallowed
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// GDPR consent helpers
// ---------------------------------------------------------------------------

/** Persist explicit user consent for analytics. */
export function grantConsent(): void {
  try {
    globalThis.localStorage?.setItem('pilot_analytics_consent', 'granted');
  } catch {
    // Silently ignore — storage may be unavailable
  }
}

/** Revoke analytics consent and signal the tracker to stop. */
export function revokeConsent(): void {
  try {
    globalThis.localStorage?.setItem('pilot_analytics_consent', 'denied');
  } catch {
    // Silently ignore
  }
}

/** Check whether the user has made an explicit consent choice. */
export function hasConsentDecision(): boolean {
  try {
    const value = globalThis.localStorage?.getItem('pilot_analytics_consent');
    return value === 'granted' || value === 'denied';
  } catch {
    return false;
  }
}

/** Returns the current consent status, or `null` if no decision has been made. */
export function getConsentStatus(): 'granted' | 'denied' | null {
  try {
    const value = globalThis.localStorage?.getItem('pilot_analytics_consent');
    if (value === 'granted' || value === 'denied') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}
