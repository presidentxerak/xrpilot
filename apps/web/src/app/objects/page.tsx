'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWalletStore } from '@/stores/wallet';
import { useMyObjects } from '@/hooks/useObjects';
import { AppShell } from '@/components/layout/AppShell';

const categories = ['All', 'Tickets', 'Coupons', 'Collectibles', 'Passes'] as const;
type Category = (typeof categories)[number];

const categoryIcons: Record<string, string> = {
  ticket: '🎫',
  coupon: '🏷️',
  collectible: '✨',
  pass: '🪪',
};

const useCases = [
  {
    title: 'Event Tickets',
    description:
      'Receive concert, sports, or conference tickets directly in your wallet. Show them at the door — no paper needed.',
  },
  {
    title: 'Loyalty Coupons',
    description:
      'Collect digital coupons from your favorite stores. They stay safe in your wallet until you are ready to use them.',
  },
  {
    title: 'Collectibles',
    description:
      'Own unique digital items — art, memorabilia, limited editions. Display them, trade them, or keep them forever.',
  },
  {
    title: 'Membership Passes',
    description:
      'Hold gym passes, club memberships, or access cards. One wallet for everything.',
  },
];

export default function ObjectsPage() {
  const [activeFilter, setActiveFilter] = useState<Category>('All');
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const { data: objects, isLoading } = useMyObjects(activeAddress ?? '');

  const filteredObjects =
    objects?.filter((obj) => {
      if (activeFilter === 'All') return true;
      return obj.category?.toLowerCase() === activeFilter.toLowerCase().slice(0, -1);
    }) ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Title */}
        <h1 className="mb-6 text-2xl font-bold text-content">My Objects</h1>

        {/* Category Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === cat
                  ? 'bg-accent text-white'
                  : 'bg-surface-raised text-content-secondary hover:bg-accent-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="pilot-card animate-pulse p-3">
                <div className="mb-3 aspect-square w-full rounded-lg bg-content-tertiary/20" />
                <div className="mb-2 h-4 w-3/4 rounded bg-content-tertiary/20" />
                <div className="h-3 w-1/2 rounded bg-content-tertiary/20" />
              </div>
            ))}
          </div>
        )}

        {/* Object Grid */}
        {!isLoading && filteredObjects.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredObjects.map((obj) => (
              <Link
                key={obj.id}
                href={`/objects/${obj.id}`}
                className="pilot-card-interactive p-3"
              >
                <div className="mb-3 aspect-square w-full rounded-lg bg-accent-subtle flex items-center justify-center overflow-hidden">
                  {obj.image ? (
                    <img
                      src={obj.image}
                      alt={obj.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">
                      {categoryIcons[obj.category] ?? '✨'}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm font-medium text-content">
                  {obj.name}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="pilot-badge bg-accent-subtle text-accent">
                    {obj.category}
                  </span>
                  <span className="truncate text-xs text-content-tertiary">
                    {obj.issuer}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredObjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent-subtle">
              <span className="text-5xl">📦</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-content">
              You don&apos;t have any objects yet
            </h2>
            <p className="mb-6 max-w-sm text-content-secondary">
              Objects are digital items like tickets, coupons, collectibles, and passes.
              When someone sends you one, it will appear here.
            </p>
            <Link href="/learn" className="pilot-button-secondary px-6 py-3">
              Learn how objects work
            </Link>
          </div>
        )}

        {/* Use Case Explanations */}
        {!isLoading && filteredObjects.length === 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-content">
              What can you do with objects?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((uc) => (
                <div key={uc.title} className="pilot-card p-5">
                  <h3 className="mb-2 text-base font-medium text-content">
                    {uc.title}
                  </h3>
                  <p className="text-sm text-content-secondary">{uc.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
