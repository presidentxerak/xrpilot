import { describe, it, expect } from 'vitest';
import {
  validateDomain,
  getDomainWarning,
  isKnownScamDomain,
  formatTransactionPreview,
  DomainTrust,
} from '../src/anti-phishing';

describe('Domain validation', () => {
  it('recognizes verified domains', () => {
    expect(validateDomain('xrpl.org')).toBe(DomainTrust.VERIFIED);
    expect(validateDomain('ripple.com')).toBe(DomainTrust.VERIFIED);
    expect(validateDomain('www.xrpscan.com')).toBe(DomainTrust.VERIFIED);
  });

  it('detects blocked/scam domains', () => {
    expect(validateDomain('xrp-airdrop.com')).toBe(DomainTrust.BLOCKED);
    expect(validateDomain('ripple-giveaway.com')).toBe(DomainTrust.BLOCKED);
  });

  it('detects suspicious domains', () => {
    expect(validateDomain('xrp-free-claim.com')).toBe(DomainTrust.SUSPICIOUS);
    expect(validateDomain('ripple-bonus-drop.net')).toBe(DomainTrust.SUSPICIOUS);
  });

  it('returns unknown for unrecognized domains', () => {
    expect(validateDomain('example.com')).toBe(DomainTrust.UNKNOWN);
    expect(validateDomain('myapp.io')).toBe(DomainTrust.UNKNOWN);
  });
});

describe('getDomainWarning', () => {
  it('returns positive message for verified domain', () => {
    const warning = getDomainWarning('xrpl.org');
    expect(warning.trust).toBe(DomainTrust.VERIFIED);
    expect(warning.message).toContain('verified');
  });

  it('returns warning for blocked domain', () => {
    const warning = getDomainWarning('xrp-airdrop.com');
    expect(warning.trust).toBe(DomainTrust.BLOCKED);
    expect(warning.message).toContain('WARNING');
  });
});

describe('isKnownScamDomain', () => {
  it('returns true for scam domains', () => {
    expect(isKnownScamDomain('xrp-airdrop.com')).toBe(true);
  });

  it('returns false for legitimate domains', () => {
    expect(isKnownScamDomain('xrpl.org')).toBe(false);
    expect(isKnownScamDomain('example.com')).toBe(false);
  });
});

describe('formatTransactionPreview', () => {
  it('formats a Payment transaction', () => {
    const preview = formatTransactionPreview({
      TransactionType: 'Payment',
      Account: 'rSender1234567890',
      Destination: 'rRecipient1234567890',
      Amount: '25000000',
      Fee: '12',
    });
    expect(preview.type).toBe('Payment');
    expect(preview.summary).toContain('Send');
    expect(preview.summary).toContain('25');
    expect(preview.fields.find((f) => f.label === 'Amount')?.value).toContain('XRP');
  });

  it('formats a TrustSet transaction', () => {
    const preview = formatTransactionPreview({
      TransactionType: 'TrustSet',
      Account: 'rSender1234567890',
      LimitAmount: { currency: 'USD', issuer: 'rIssuer123', value: '1000' },
      Fee: '12',
    });
    expect(preview.type).toBe('TrustSet');
    expect(preview.summary).toContain('trust line');
    expect(preview.fields.find((f) => f.label === 'Trust Currency')?.value).toBe('USD');
  });

  it('warns about high fees', () => {
    const preview = formatTransactionPreview({
      TransactionType: 'Payment',
      Account: 'rSender1234567890',
      Destination: 'rRecipient1234567890',
      Amount: '1000000',
      Fee: '5000000',
    });
    expect(preview.warnings.length).toBeGreaterThan(0);
    expect(preview.warnings[0]).toContain('high fee');
  });

  it('warns about SetRegularKey', () => {
    const preview = formatTransactionPreview({
      TransactionType: 'SetRegularKey',
      Account: 'rSender1234567890',
      RegularKey: 'rOtherKey1234567890',
      Fee: '12',
    });
    expect(preview.warnings).toContain(
      'This grants another key full access to your account. Proceed with extreme caution.',
    );
  });

  it('handles unknown transaction formats gracefully', () => {
    const preview = formatTransactionPreview('not an object');
    expect(preview.type).toBe('Unknown');
    expect(preview.warnings.length).toBeGreaterThan(0);
  });
});
