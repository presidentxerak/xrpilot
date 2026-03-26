'use client';

import type { Transaction } from '@/hooks/useWallet';

interface ActivityListProps {
  transactions: Transaction[];
  address: string;
  limit?: number;
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (txDate.getTime() === today.getTime()) return 'Today';
  if (txDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const diffDays = Math.floor(
    (today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 7) return 'This Week';
  if (diffDays < 30) return 'This Month';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ActivityList({
  transactions,
  address,
  limit,
}: ActivityListProps) {
  const items = limit ? transactions.slice(0, limit) : transactions;

  if (items.length === 0) {
    return (
      <div className="pilot-card py-8 text-center">
        <div className="mb-3 text-4xl">📋</div>
        <p className="text-content-secondary">No activity yet.</p>
        <p className="mt-1 text-sm text-content-tertiary">
          Your transactions will appear here when you send or receive payments.
        </p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  for (const tx of items) {
    const group = getDateGroup(tx.date);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(tx);
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([group, txs]) => (
        <div key={group}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-content-tertiary">
            {group}
          </p>
          <div className="space-y-2">
            {txs.map((tx) => {
              const isSent = tx.type === 'sent';
              const amountFormatted = Number(tx.amount).toLocaleString(
                undefined,
                { maximumFractionDigits: 6 }
              );
              const label = isSent
                ? `Sent ${amountFormatted} ${tx.currency}`
                : `Received ${amountFormatted} ${tx.currency}`;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl bg-surface-raised p-4 border border-[var(--border)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                        isSent
                          ? 'bg-accent-subtle text-accent'
                          : 'bg-success-subtle text-success'
                      }`}
                    >
                      {isSent ? '\u2191' : '\u2193'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-content">
                        {label}
                      </p>
                      <p className="text-xs text-content-tertiary">
                        {formatTime(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`pilot-badge text-[10px] min-h-0 min-w-0 ${
                        tx.status === 'confirmed'
                          ? 'bg-success-subtle text-success'
                          : 'bg-warning-subtle text-warning'
                      }`}
                    >
                      {tx.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
