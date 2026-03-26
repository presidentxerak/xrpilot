'use client';

import Link from 'next/link';

interface WalletCTAProps {
  variant?: 'button' | 'card' | 'banner';
  className?: string;
}

export function WalletCTA({ variant = 'button', className = '' }: WalletCTAProps) {
  if (variant === 'button') {
    return (
      <Link
        href="/wallet"
        className={`inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl text-base font-medium min-h-[48px] hover:bg-blue-700 transition-colors ${className}`}
      >
        Open Your Wallet
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <Link
        href="/wallet"
        className={`block p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white hover:from-blue-700 hover:to-blue-800 transition-all ${className}`}
      >
        <h3 className="text-lg font-medium mb-2">Receive Your First Object</h3>
        <p className="text-blue-100 text-sm mb-4">
          Digital tickets, coupons, and collectibles — all in one place.
        </p>
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          Get Started <span aria-hidden>→</span>
        </span>
      </Link>
    );
  }

  // banner variant
  return (
    <div
      className={`bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div>
        <h3 className="text-lg font-medium text-white">Try Pilot</h3>
        <p className="text-gray-400 text-sm mt-1">
          The simplest way to manage digital objects.
        </p>
      </div>
      <Link
        href="/wallet"
        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-medium min-h-[48px] hover:bg-gray-100 transition-colors whitespace-nowrap"
      >
        Open Pilot
      </Link>
    </div>
  );
}
