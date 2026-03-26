'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWalletStore } from '@/stores/wallet';
import { useSession } from '@/hooks/useSecurity';

export function Header() {
  const accounts = useWalletStore((s) => s.accounts);
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const setActiveAddress = useWalletStore((s) => s.setActiveAddress);
  const { lock } = useSession();

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const activeAccount = accounts.find((a) => a.address === activeAddress);
  const shortAddress = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : '';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-surface px-4 py-3 safe-top lg:px-6">
      {/* Logo (mobile only) */}
      <Link
        href="/pilot/app"
        className="flex items-center gap-2 lg:hidden"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs text-white font-bold">
          P
        </span>
        <span className="text-base font-bold text-content">Pilot</span>
      </Link>

      {/* Spacer for desktop (logo is in sidebar) */}
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {/* Network Indicator */}
        <span className="pilot-badge bg-success-subtle text-success text-[10px] min-h-0 min-w-0">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
          Mainnet
        </span>

        {/* Account Selector */}
        {activeAccount && (
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 text-sm font-medium text-content border border-[var(--border)] min-h-0"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white min-h-0 min-w-0">
                {activeAccount.label[0]}
              </span>
              <span className="hidden sm:inline">{activeAccount.label}</span>
              <span className="text-content-tertiary text-xs">
                {shortAddress}
              </span>
            </button>

            {showAccountMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAccountMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-surface shadow-lg border border-[var(--border)] py-2">
                  {accounts.map((acc) => (
                    <button
                      key={acc.address}
                      onClick={() => {
                        setActiveAddress(acc.address);
                        setShowAccountMenu(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        acc.address === activeAddress
                          ? 'bg-accent-subtle text-accent'
                          : 'text-content hover:bg-surface-raised'
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs text-white min-h-0 min-w-0">
                        {acc.label[0]}
                      </span>
                      <div>
                        <p className="font-medium">{acc.label}</p>
                        <p className="text-xs text-content-tertiary">
                          {acc.address.slice(0, 8)}...{acc.address.slice(-4)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Lock Button */}
        <button
          onClick={lock}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-raised transition-colors min-h-0 min-w-0"
          aria-label="Lock wallet"
          title="Lock wallet"
        >
          <span className="text-lg">🔒</span>
        </button>
      </div>
    </header>
  );
}
