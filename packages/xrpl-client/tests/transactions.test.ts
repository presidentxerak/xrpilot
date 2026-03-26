import { describe, it, expect } from 'vitest';
import { buildSendXrpTransaction, toHumanReadable } from '../src/transactions';
import type { Transaction, Payment } from 'xrpl';

describe('buildSendXrpTransaction', () => {
  it('builds a basic payment', () => {
    const tx = buildSendXrpTransaction({
      from: 'rSenderAddress123456',
      to: 'rRecipientAddress789',
      amount: '25',
    });

    expect(tx.TransactionType).toBe('Payment');
    expect(tx.Account).toBe('rSenderAddress123456');
    expect(tx.Destination).toBe('rRecipientAddress789');
    expect(tx.Amount).toBe('25000000'); // 25 XRP in drops
  });

  it('includes destination tag when provided', () => {
    const tx = buildSendXrpTransaction({
      from: 'rSender',
      to: 'rRecipient',
      amount: '10',
      destinationTag: 12345,
    });

    expect(tx.DestinationTag).toBe(12345);
  });

  it('omits destination tag when not provided', () => {
    const tx = buildSendXrpTransaction({
      from: 'rSender',
      to: 'rRecipient',
      amount: '10',
    });

    expect(tx.DestinationTag).toBeUndefined();
  });

  it('includes memos when provided', () => {
    const tx = buildSendXrpTransaction({
      from: 'rSender',
      to: 'rRecipient',
      amount: '5',
      memos: ['Payment for services'],
    });

    expect(tx.Memos).toBeDefined();
    expect(tx.Memos!.length).toBe(1);
  });
});

describe('toHumanReadable', () => {
  it('describes an XRP payment', () => {
    const tx: Payment = {
      TransactionType: 'Payment',
      Account: 'rSenderAddress123456',
      Destination: 'rRecipientAddress789012345',
      Amount: '25000000',
    };

    const readable = toHumanReadable(tx as Transaction);
    expect(readable.summary).toContain('Send');
    expect(readable.summary).toContain('25');
    expect(readable.summary).toContain('XRP');
    expect(readable.description).toContain('You are sending');
    expect(readable.description).toContain('25');
  });

  it('shows remaining balance when provided', () => {
    const tx: Payment = {
      TransactionType: 'Payment',
      Account: 'rSender',
      Destination: 'rRecipient',
      Amount: '25000000',
    };

    const readable = toHumanReadable(tx as Transaction, '50000000');
    expect(readable.description).toContain('After this');
    expect(readable.description).toContain('25.00');
  });

  it('warns about low remaining balance', () => {
    const tx: Payment = {
      TransactionType: 'Payment',
      Account: 'rSender',
      Destination: 'rRecipient',
      Amount: '45000000',
    };

    const readable = toHumanReadable(tx as Transaction, '50000000');
    expect(readable.warnings.length).toBeGreaterThan(0);
    expect(readable.warnings[0]).toContain('minimum reserve');
  });

  it('describes a TrustSet as "Allow token"', () => {
    const tx = {
      TransactionType: 'TrustSet',
      Account: 'rAccount',
      LimitAmount: { currency: 'USD', issuer: 'rIssuer', value: '1000' },
    } as unknown as Transaction;

    const readable = toHumanReadable(tx);
    expect(readable.summary).toContain('Allow');
    expect(readable.summary).toContain('USD');
  });

  it('describes TrustSet removal', () => {
    const tx = {
      TransactionType: 'TrustSet',
      Account: 'rAccount',
      LimitAmount: { currency: 'USD', issuer: 'rIssuer', value: '0' },
    } as unknown as Transaction;

    const readable = toHumanReadable(tx);
    expect(readable.summary).toContain('Remove');
  });

  it('describes NFTokenMint as "Mint a new digital object"', () => {
    const tx = {
      TransactionType: 'NFTokenMint',
      Account: 'rAccount',
      NFTokenTaxon: 0,
    } as unknown as Transaction;

    const readable = toHumanReadable(tx);
    expect(readable.summary).toContain('digital object');
  });

  it('describes OfferCreate as swap', () => {
    const tx = {
      TransactionType: 'OfferCreate',
      Account: 'rAccount',
      TakerPays: '50000000',
      TakerGets: { currency: 'USD', value: '25', issuer: 'rIssuer' },
    } as unknown as Transaction;

    const readable = toHumanReadable(tx);
    expect(readable.summary).toContain('Swap');
  });

  it('handles unknown transaction types gracefully', () => {
    const tx = {
      TransactionType: 'SomeNewType',
      Account: 'rAccount',
    } as unknown as Transaction;

    const readable = toHumanReadable(tx);
    expect(readable.summary).toContain('SomeNewType');
  });
});
