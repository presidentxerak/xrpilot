import React from 'react';

interface Transaction {
  TransactionType?: string;
  Destination?: string;
  Amount?: string | { value: string; currency: string; issuer?: string };
  Fee?: string;
  LimitAmount?: { value: string; currency: string; issuer?: string };
  TakerGets?: string | { value: string; currency: string };
  TakerPays?: string | { value: string; currency: string };
  NFTokenTaxon?: number;
  [key: string]: unknown;
}

interface TransactionPreviewProps {
  transaction: Transaction;
}

const HIGH_VALUE_THRESHOLD_DROPS = 100_000_000; // 100 XRP

function dropsToXrp(drops: string): string {
  const value = parseInt(drops, 10);
  if (isNaN(value)) return drops;
  return (value / 1_000_000).toFixed(6).replace(/\.?0+$/, '');
}

function formatAmount(amount: string | { value: string; currency: string; issuer?: string }): string {
  if (typeof amount === 'string') {
    return `${dropsToXrp(amount)} XRP`;
  }
  return `${amount.value} ${amount.currency}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function isHighValue(transaction: Transaction): boolean {
  if (typeof transaction.Amount === 'string') {
    return parseInt(transaction.Amount, 10) >= HIGH_VALUE_THRESHOLD_DROPS;
  }
  return false;
}

function describeTransaction(tx: Transaction): string {
  switch (tx.TransactionType) {
    case 'Payment':
      return `Send ${formatAmount(tx.Amount ?? '0')} to ${truncateAddress(tx.Destination ?? 'unknown')}`;
    case 'TrustSet':
      return `Allow ${tx.LimitAmount?.currency ?? 'unknown currency'} in your wallet`;
    case 'OfferCreate':
      return `Swap ${formatAmount(tx.TakerPays ?? '0')} for ${formatAmount(tx.TakerGets ?? '0')}`;
    case 'NFTokenMint':
      return 'Create new digital object';
    case 'NFTokenBurn':
      return 'Destroy a digital object';
    case 'NFTokenCreateOffer':
      return 'Create offer for a digital object';
    case 'NFTokenAcceptOffer':
      return 'Accept offer for a digital object';
    case 'AccountSet':
      return 'Update account settings';
    case 'AccountDelete':
      return 'Delete this account permanently';
    default:
      return `Execute ${tx.TransactionType ?? 'unknown'} transaction`;
  }
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({ transaction }) => {
  const description = describeTransaction(transaction);
  const fee = transaction.Fee ? dropsToXrp(transaction.Fee) : '0.000012';
  const highValue = isHighValue(transaction);

  return (
    <div className="space-y-3">
      {highValue && (
        <div className="flex items-center gap-2 px-4 py-3 bg-pilot-danger/20 border border-pilot-danger/40 rounded-lg min-h-[44px]">
          <span className="text-pilot-danger text-lg" aria-hidden="true">{'\u26A0'}</span>
          <p className="text-pilot-danger text-sm font-medium">
            High-value transaction. Please verify the details carefully.
          </p>
        </div>
      )}

      <div className="bg-pilot-surface border border-pilot-border rounded-lg p-4 space-y-3">
        <div>
          <p className="text-pilot-muted text-xs uppercase tracking-wide mb-1">
            Transaction
          </p>
          <p className="text-pilot-text text-base font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="border-t border-pilot-border pt-3">
          <p className="text-pilot-muted text-xs uppercase tracking-wide mb-1">
            Type
          </p>
          <p className="text-pilot-text text-sm">
            {transaction.TransactionType ?? 'Unknown'}
          </p>
        </div>

        {transaction.Destination && (
          <div className="border-t border-pilot-border pt-3">
            <p className="text-pilot-muted text-xs uppercase tracking-wide mb-1">
              Destination
            </p>
            <p className="text-pilot-text text-sm font-mono">
              {transaction.Destination}
            </p>
          </div>
        )}

        {transaction.Amount && (
          <div className="border-t border-pilot-border pt-3">
            <p className="text-pilot-muted text-xs uppercase tracking-wide mb-1">
              Amount
            </p>
            <p className="text-pilot-text text-sm font-medium">
              {formatAmount(transaction.Amount)}
            </p>
          </div>
        )}

        <div className="border-t border-pilot-border pt-3">
          <p className="text-pilot-muted text-xs uppercase tracking-wide mb-1">
            Network fee
          </p>
          <p className="text-pilot-text text-sm">
            {fee} XRP
          </p>
        </div>
      </div>
    </div>
  );
};
