'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DigitalObject } from '@/hooks/useObjects';

const categories = ['All', 'Tickets', 'Coupons', 'Collectibles', 'Passes'] as const;

const categoryIcons: Record<string, string> = {
  ticket: '🎫',
  coupon: '🏷️',
  collectible: '✨',
  pass: '🪪',
};

interface ObjectGalleryProps {
  objects: DigitalObject[];
  isLoading?: boolean;
}

export function ObjectGallery({ objects, isLoading }: ObjectGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered = objects.filter((obj) => {
    if (activeFilter === 'All') return true;
    return obj.category?.toLowerCase() === activeFilter.toLowerCase().slice(0, -1);
  });

  return (
    <div>
      {/* Category Tab Filters */}
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

      {/* Object Cards Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((obj) => (
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
                {obj.issuerName && (
                  <span className="truncate text-xs text-content-tertiary">
                    {obj.issuerName}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent-subtle">
            <span className="text-5xl">📦</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-content">
            No objects found
          </h2>
          <p className="max-w-sm text-content-secondary">
            {activeFilter === 'All'
              ? 'You do not have any objects yet. When someone sends you a ticket, coupon, or collectible, it will show up here.'
              : `You do not have any ${activeFilter.toLowerCase()} yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
