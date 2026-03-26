import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  anonymizeAddress,
  sanitizeProperties,
  isTrackingAllowed,
  grantConsent,
  revokeConsent,
  hasConsentDecision,
  getConsentStatus,
} from '../src/privacy.js';

// ---------------------------------------------------------------------------
// anonymizeAddress
// ---------------------------------------------------------------------------

describe('anonymizeAddress', () => {
  it('should return a deterministic hash for the same input', () => {
    const addr = 'rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG';
    expect(anonymizeAddress(addr)).toBe(anonymizeAddress(addr));
  });

  it('should produce different hashes for different addresses', () => {
    const a = anonymizeAddress('rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG');
    const b = anonymizeAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
    expect(a).not.toBe(b);
  });

  it('should prefix output with "anon_"', () => {
    const result = anonymizeAddress('rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG');
    expect(result).toMatch(/^anon_[0-9a-f]{8}$/);
  });

  it('should not contain the original address', () => {
    const addr = 'rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG';
    const result = anonymizeAddress(addr);
    expect(result).not.toContain(addr);
  });

  it('should handle empty strings gracefully', () => {
    const result = anonymizeAddress('');
    expect(result).toMatch(/^anon_[0-9a-f]{8}$/);
  });
});

// ---------------------------------------------------------------------------
// sanitizeProperties
// ---------------------------------------------------------------------------

describe('sanitizeProperties', () => {
  it('should keep safe properties', () => {
    const result = sanitizeProperties({
      page: 'home',
      count: 5,
      is_new: true,
    });
    expect(result).toEqual({ page: 'home', count: 5, is_new: true });
  });

  it('should strip keys matching PII patterns', () => {
    const result = sanitizeProperties({
      safe_key: 'ok',
      email: 'user@example.com',
      private_key: 'sEdTM1uX8pu9do5Yun...',
      seed: 'sEdTM1uX8pu9do5Yun...',
      mnemonic: 'abandon abandon...',
      password: 'hunter2',
      pin: '1234',
      phone: '+1234567890',
      name: 'John',
      secret: 'shh',
      ssn: '123-45-6789',
      credential: 'abc',
      token: 'xyz',
      auth: 'bearer ...',
    });
    expect(Object.keys(result)).toEqual(['safe_key']);
  });

  it('should strip values that look like XRPL addresses', () => {
    const result = sanitizeProperties({
      sender: 'rN7n3473SaZBCG4dFL83w7p1W9cgPJKXuG',
      label: 'not_an_address',
    });
    expect(result).toEqual({ label: 'not_an_address' });
  });

  it('should strip values that look like email addresses', () => {
    const result = sanitizeProperties({
      contact: 'alice@example.com',
      category: 'nft',
    });
    expect(result).toEqual({ category: 'nft' });
  });

  it('should not mutate the original object', () => {
    const original = { secret: 'bad', ok: 'fine' };
    const result = sanitizeProperties(original);
    expect(original).toEqual({ secret: 'bad', ok: 'fine' });
    expect(result).toEqual({ ok: 'fine' });
  });

  it('should allow "address_hash" key (not PII)', () => {
    const result = sanitizeProperties({
      address_hash: 'anon_abc12345',
    });
    expect(result).toEqual({ address_hash: 'anon_abc12345' });
  });
});

// ---------------------------------------------------------------------------
// isTrackingAllowed
// ---------------------------------------------------------------------------

describe('isTrackingAllowed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should return false when navigator is undefined (server-side)', () => {
    // In the test environment navigator may or may not exist; stub to be safe
    vi.stubGlobal('navigator', undefined);
    expect(isTrackingAllowed()).toBe(false);
  });

  it('should return false when Do Not Track is set', () => {
    vi.stubGlobal('navigator', { doNotTrack: '1' });
    vi.stubGlobal('localStorage', {
      getItem: () => 'granted',
      setItem: vi.fn(),
    });
    expect(isTrackingAllowed()).toBe(false);
  });

  it('should return false when Global Privacy Control is set', () => {
    vi.stubGlobal('navigator', { doNotTrack: '0', globalPrivacyControl: true });
    vi.stubGlobal('localStorage', {
      getItem: () => 'granted',
      setItem: vi.fn(),
    });
    expect(isTrackingAllowed()).toBe(false);
  });

  it('should return false when consent is denied', () => {
    vi.stubGlobal('navigator', { doNotTrack: '0' });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'pilot_analytics_consent' ? 'denied' : null),
      setItem: vi.fn(),
    });
    expect(isTrackingAllowed()).toBe(false);
  });

  it('should return true when all signals allow tracking', () => {
    vi.stubGlobal('navigator', { doNotTrack: '0' });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'pilot_analytics_consent' ? 'granted' : null),
      setItem: vi.fn(),
    });
    expect(isTrackingAllowed()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GDPR consent helpers
// ---------------------------------------------------------------------------

describe('GDPR consent helpers', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('grantConsent should persist "granted"', () => {
    grantConsent();
    expect(store['pilot_analytics_consent']).toBe('granted');
  });

  it('revokeConsent should persist "denied"', () => {
    revokeConsent();
    expect(store['pilot_analytics_consent']).toBe('denied');
  });

  it('hasConsentDecision should return true after grant', () => {
    grantConsent();
    expect(hasConsentDecision()).toBe(true);
  });

  it('hasConsentDecision should return false when no decision', () => {
    expect(hasConsentDecision()).toBe(false);
  });

  it('getConsentStatus should return current status', () => {
    expect(getConsentStatus()).toBeNull();
    grantConsent();
    expect(getConsentStatus()).toBe('granted');
    revokeConsent();
    expect(getConsentStatus()).toBe('denied');
  });
});
