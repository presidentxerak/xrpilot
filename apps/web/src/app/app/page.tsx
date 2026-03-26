'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/stores/wallet';
import { useUIStore } from '@/stores/ui';
import { useBalance, useTransactionHistory } from '@/hooks/useWallet';
import { useMyObjects } from '@/hooks/useObjects';
import { AppShell } from '@/components/layout/AppShell';
import { BalanceCard } from '@/components/features/BalanceCard';
import { ActivityList } from '@/components/features/ActivityList';
import Link from 'next/link';

export default function AppPage() {
  const router = useRouter();
  const accounts = useWalletStore((s) => s.accounts);
  const activeAccount = useWalletStore((s) => s.activeAccount);
  const onboardingComplete = useUIStore((s) => s.onboardingComplete);

  const address = activeAccount?.address ?? '';
  const { data: balance } = useBalance(address);
  const { data: transactions } = useTransactionHistory(address);
  const { data: objects } = useMyObjects(address);

  useEffect(() => {
    if (accounts.length === 0 || !onboardingComplete) {
      router.replace('/app/onboarding');
    }
  }, [accounts, onboardingComplete, router]);

  if (accounts.length === 0 || !activeAccount) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-content">Your Wallet</h1>
          <p className="text-content-secondary">
            Here is what is happening with your account.
          </p>
        </div>

        {/* Balance */}
        <BalanceCard balance={balance ?? 0} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/app/send"
            className="pilot-card-interactive flex flex-col items-center justify-center gap-2 py-5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-accent text-xl">
              &uarr;
            </span>
            <span className="text-sm font-medium text-content">Send</span>
          </Link>

          <Link
            href="/app/receive"
            className="pilot-card-interactive flex flex-col items-center justify-center gap-2 py-5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success text-xl">
              &darr;
            </span>
            <span className="text-sm font-medium text-content">Receive</span>
          </Link>
        </div>

        {/* My Objects Preview */}
        {objects && objects.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="pilot-section-title mb-0">My Objects</h2>
              <Link
                href="/objects"
                className="text-sm font-medium text-accent min-h-touch flex items-center"
              >
                View All
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {objects.slice(0, 4).map((obj) => (
                <Link
                  key={obj.id}
                  href={`/objects/${obj.id}`}
                  className="pilot-card-interactive flex-shrink-0 w-32 p-3"
                >
                  <div className="mb-2 aspect-square w-full rounded-lg bg-accent-subtle flex items-center justify-center text-2xl">
                    {obj.image ? (
                      <img
                        src={obj.image}
                        alt={obj.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span role="img" aria-label={obj.category}>
                        {obj.category === 'ticket'
                          ? '🎫'
                          : obj.category === 'coupon'
                            ? '🏷️'
                            : obj.category === 'pass'
                              ? '🪪'
                              : '✨'}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-content">
                    {obj.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="pilot-section-title">Recent Activity</h2>
          <ActivityList
            transactions={transactions ?? []}
            address={address}
            limit={5}
          />
          {transactions && transactions.length === 0 && (
            <div className="pilot-card py-8 text-center">
              <p className="text-content-secondary">No activity yet.</p>
              <p className="mt-1 text-sm text-content-tertiary">
                Your transactions will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
