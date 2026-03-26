'use client';

import { useWalletStore } from '@/stores/wallet';
import { useAccountTokens } from '@/hooks/useWallet';

interface BalanceCardProps {
  balance: number;
}

const BASE_RESERVE = 10;
const OWNER_RESERVE_PER_ITEM = 2;

export function BalanceCard({ balance }: BalanceCardProps) {
  const isAdvancedMode = useWalletStore((s) => s.isAdvancedMode);
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const { data: tokens } = useAccountTokens(activeAddress ?? '');

  const reserveItems = (tokens?.length ?? 0) + 1; // trust lines + base
  const totalReserve = BASE_RESERVE + reserveItems * OWNER_RESERVE_PER_ITEM;
  const spendable = Math.max(0, balance - totalReserve);

  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return (
    <div className="pilot-card p-6">
      {/* Main Balance */}
      <div className="mb-1 text-center">
        <p className="text-sm font-medium text-content-tertiary">Available</p>
        <p className="text-4xl font-bold text-content tracking-tight">
          {isAdvancedMode
            ? spendable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })
            : formattedBalance}{' '}
          <span className="text-lg font-medium text-content-secondary">XRP</span>
        </p>
      </div>

      {/* Advanced Mode: Reserve Breakdown */}
      {isAdvancedMode && (
        <div className="mt-4 space-y-2 rounded-xl bg-surface p-4 border border-[var(--border)]">
          <div className="flex justify-between text-sm">
            <span className="text-content-secondary">Total balance</span>
            <span className="font-medium text-content">
              {formattedBalance} XRP
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-content-secondary">Base reserve</span>
            <span className="font-medium text-content">
              {BASE_RESERVE} XRP
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-content-secondary">
              Owner reserve ({reserveItems} items)
            </span>
            <span className="font-medium text-content">
              {reserveItems * OWNER_RESERVE_PER_ITEM} XRP
            </span>
          </div>
          <div className="border-t border-[var(--border)] pt-2 flex justify-between text-sm font-medium">
            <span className="text-content">Spendable</span>
            <span className="text-accent">
              {spendable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{' '}
              XRP
            </span>
          </div>
        </div>
      )}

      {/* Token List */}
      {tokens && tokens.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-content-tertiary">
            Tokens
          </p>
          {tokens.map((token) => (
            <div
              key={`${token.currency}-${token.issuer}`}
              className="flex items-center justify-between rounded-lg bg-surface p-3 border border-[var(--border)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle text-xs font-bold text-accent min-h-0 min-w-0">
                  {token.currency.slice(0, 2)}
                </span>
                <span className="text-sm font-medium text-content">
                  {token.name ?? token.currency}
                </span>
              </div>
              <span className="text-sm text-content-secondary">
                {Number(token.balance).toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
