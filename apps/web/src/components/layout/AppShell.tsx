'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSecurity';
import { useWalletStore } from '@/stores/wallet';
import { Header } from './Header';

const navItems = [
  { href: '/pilot/app', label: 'Home', icon: '🏠' },
  { href: '/pilot/objects', label: 'Objects', icon: '📦' },
  { href: '/pilot/app/swap', label: 'Swap', icon: '🔄' },
  { href: '/pilot/security', label: 'Settings', icon: '⚙️' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLocked, unlock } = useSession();
  const pinInput = useWalletStore((s) => s.isLocked);

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-surface-raised">
        <div className="p-6">
          <Link href="/pilot/app" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm text-white font-bold">
              P
            </span>
            <span className="text-lg font-bold text-content">Pilot</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/pilot/app'
                ? pathname === '/pilot/app'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-content-secondary hover:bg-surface hover:text-content'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-surface safe-bottom lg:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around">
            {navItems.map((item) => {
              const isActive =
                item.href === '/pilot/app'
                  ? pathname === '/pilot/app'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                    isActive ? 'text-accent' : 'text-content-tertiary'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Lock Screen Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface">
          <div className="flex flex-col items-center text-center px-6">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl text-white font-bold">
              P
            </div>
            <h2 className="mb-2 text-2xl font-bold text-content">
              Wallet Locked
            </h2>
            <p className="mb-8 text-content-secondary">
              Enter your PIN to unlock your wallet.
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit PIN"
              className="pilot-input mb-4 max-w-xs text-center text-2xl tracking-[0.5em]"
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  (e.target as HTMLInputElement).value.length === 6
                ) {
                  unlock();
                }
              }}
            />
            <button
              onClick={unlock}
              className="pilot-button-primary w-full max-w-xs py-3"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
