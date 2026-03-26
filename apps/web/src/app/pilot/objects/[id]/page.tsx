'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useObject } from '@/hooks/useObjects';
import { AppShell } from '@/components/layout/AppShell';

export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;
  const { data: object, isLoading } = useObject(objectId);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg px-4 py-6 animate-pulse">
          <div className="mb-6 h-10 w-24 rounded bg-content-tertiary/20" />
          <div className="mb-6 aspect-square w-full rounded-2xl bg-content-tertiary/20" />
          <div className="mb-3 h-8 w-3/4 rounded bg-content-tertiary/20" />
          <div className="mb-6 h-4 w-full rounded bg-content-tertiary/20" />
        </div>
      </AppShell>
    );
  }

  if (!object) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <p className="mb-4 text-xl font-bold text-content">Object not found</p>
          <p className="mb-6 text-content-secondary">
            This object may have been transferred or does not exist.
          </p>
          <button
            onClick={() => router.push('/pilot/objects')}
            className="pilot-button-primary px-6 py-3"
          >
            Back to My Objects
          </button>
        </div>
      </AppShell>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: object.name,
        text: `Check out this object: ${object.name}`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-raised"
            aria-label="Go back"
          >
            <span className="text-xl">&larr;</span>
          </button>
          <h1 className="text-xl font-bold text-content">Object Details</h1>
        </div>

        {/* Large Image Display */}
        <div className="mb-6 aspect-square w-full overflow-hidden rounded-2xl bg-accent-subtle flex items-center justify-center">
          {object.image ? (
            <img
              src={object.image}
              alt={object.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-7xl">
              {object.category === 'ticket'
                ? '🎫'
                : object.category === 'coupon'
                  ? '🏷️'
                  : object.category === 'pass'
                    ? '🪪'
                    : '✨'}
            </span>
          )}
        </div>

        {/* Name and Category */}
        <div className="mb-4">
          <h2 className="mb-1 text-2xl font-bold text-content">{object.name}</h2>
          <span className="pilot-badge bg-accent-subtle text-accent">
            {object.category}
          </span>
        </div>

        {/* Description */}
        {object.description && (
          <p className="mb-4 text-content-secondary leading-relaxed">
            {object.description}
          </p>
        )}

        {/* Utility */}
        {object.utility && (
          <div className="mb-4 rounded-xl bg-surface-raised p-4 border border-[var(--border)]">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-content-tertiary">
              What you can do with this
            </p>
            <p className="text-sm text-content">{object.utility}</p>
          </div>
        )}

        {/* Issuer */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-accent font-bold">
            {object.issuerName?.[0] ?? 'I'}
          </div>
          <div>
            <p className="text-xs text-content-tertiary">Issued by</p>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-content">
                {object.issuerName ?? object.issuer}
              </p>
              {object.issuerVerified && (
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[10px]"
                  title="Verified issuer"
                >
                  &#10003;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="pilot-button-secondary py-3"
          >
            Share
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="pilot-button-primary py-3"
          >
            Transfer
          </button>
        </div>

        {/* Expandable Metadata */}
        <div className="mb-6">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex w-full items-center justify-between rounded-xl bg-surface-raised p-4 border border-[var(--border)]"
          >
            <span className="text-sm font-medium text-content">Details &amp; Metadata</span>
            <span
              className={`text-content-tertiary transition-transform duration-200 ${
                showMetadata ? 'rotate-180' : ''
              }`}
            >
              &#9660;
            </span>
          </button>
          {showMetadata && (
            <div className="mt-2 rounded-xl bg-surface-raised p-4 border border-[var(--border)] space-y-3">
              {object.tokenId && (
                <div>
                  <p className="text-xs text-content-tertiary">Token ID</p>
                  <p className="break-all text-sm text-content font-mono">
                    {object.tokenId}
                  </p>
                </div>
              )}
              {object.issuer && (
                <div>
                  <p className="text-xs text-content-tertiary">Issuer Address</p>
                  <p className="break-all text-sm text-content font-mono">
                    {object.issuer}
                  </p>
                </div>
              )}
              {object.createdAt && (
                <div>
                  <p className="text-xs text-content-tertiary">Created</p>
                  <p className="text-sm text-content">
                    {new Date(object.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {object.flags != null && (
                <div>
                  <p className="text-xs text-content-tertiary">Transferable</p>
                  <p className="text-sm text-content">
                    {object.transferable ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transfer History */}
        <div>
          <h3 className="pilot-section-title">Transfer History</h3>
          {object.history && object.history.length > 0 ? (
            <div className="space-y-3">
              {object.history.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-surface-raised p-4 border border-[var(--border)]"
                >
                  <div>
                    <p className="text-sm font-medium text-content">{entry.type}</p>
                    <p className="text-xs text-content-tertiary">
                      {entry.from?.slice(0, 8)}... &rarr; {entry.to?.slice(0, 8)}...
                    </p>
                  </div>
                  <p className="text-xs text-content-tertiary">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="pilot-card py-6 text-center">
              <p className="text-content-secondary">No transfer history yet.</p>
              <p className="mt-1 text-sm text-content-tertiary">
                When this object is transferred, the history will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--surface-overlay)] sm:items-center">
            <div className="w-full max-w-lg rounded-t-2xl bg-surface p-6 sm:rounded-2xl safe-bottom">
              <h3 className="mb-4 text-lg font-bold text-content">
                Transfer this object
              </h3>
              <p className="mb-4 text-sm text-content-secondary">
                Enter the address of the person you want to send this object to.
              </p>
              <input
                type="text"
                placeholder="Recipient address"
                className="pilot-input mb-4"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="pilot-button-secondary py-3"
                >
                  Cancel
                </button>
                <button className="pilot-button-primary py-3">
                  Send Object
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
