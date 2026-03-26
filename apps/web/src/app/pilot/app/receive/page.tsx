'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/stores/wallet';
import { AppShell } from '@/components/layout/AppShell';

export default function ReceivePage() {
  const router = useRouter();
  const activeAccount = useWalletStore((s) => s.activeAccount);
  const address = activeAccount?.address ?? '';

  const [copied, setCopied] = useState(false);
  const [showTagInfo, setShowTagInfo] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  }, [address]);

  const handleShare = useCallback(async () => {
    if (!address) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pilot Address',
          text: `Send to my Pilot wallet: ${address}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  }, [address, handleCopy]);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-raised"
            aria-label="Go back"
          >
            <span className="text-xl">&larr;</span>
          </button>
          <h1 className="text-xl font-bold text-content">Receive</h1>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* QR Code */}
          <div className="pilot-card flex flex-col items-center p-8">
            <p className="mb-4 text-content-secondary">
              Show this code to receive a payment
            </p>

            {/* QR Code placeholder - in production, use a QR library */}
            <div className="mb-6 flex h-48 w-48 items-center justify-center rounded-pilot-lg border-2 border-dashed border-[var(--border)] bg-white">
              <div className="text-center p-4">
                <svg
                  viewBox="0 0 100 100"
                  className="h-40 w-40"
                  role="img"
                  aria-label={`QR code for address ${address}`}
                >
                  {/* Simplified QR pattern representation */}
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="25" height="25" rx="2" fill="#0f172a" />
                  <rect x="70" y="5" width="25" height="25" rx="2" fill="#0f172a" />
                  <rect x="5" y="70" width="25" height="25" rx="2" fill="#0f172a" />
                  <rect x="10" y="10" width="15" height="15" rx="1" fill="white" />
                  <rect x="75" y="10" width="15" height="15" rx="1" fill="white" />
                  <rect x="10" y="75" width="15" height="15" rx="1" fill="white" />
                  <rect x="14" y="14" width="7" height="7" fill="#0f172a" />
                  <rect x="79" y="14" width="7" height="7" fill="#0f172a" />
                  <rect x="14" y="79" width="7" height="7" fill="#0f172a" />
                  {/* Center pattern */}
                  <rect x="35" y="35" width="30" height="30" rx="4" fill="#3378ff" />
                  <text
                    x="50"
                    y="54"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="Roboto, sans-serif"
                  >
                    P
                  </text>
                </svg>
              </div>
            </div>

            {/* Address */}
            <div className="w-full rounded-pilot bg-surface-raised p-3 text-center">
              <p className="break-all font-mono text-sm text-content">
                {address}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="pilot-button-primary py-3"
            >
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button
              onClick={handleShare}
              className="pilot-button-secondary py-3"
            >
              Share
            </button>
          </div>

          {/* Destination Tag Info */}
          <div className="pilot-card p-4">
            <button
              onClick={() => setShowTagInfo(!showTagInfo)}
              className="flex w-full items-center justify-between min-h-touch"
            >
              <span className="text-sm font-medium text-content">
                Do I need a destination tag?
              </span>
              <span className="text-content-tertiary">
                {showTagInfo ? '\u2212' : '+'}
              </span>
            </button>
            {showTagInfo && (
              <div className="mt-3 animate-fade-in">
                <p className="text-sm text-content-secondary leading-relaxed">
                  A destination tag is an extra number that some services use to
                  identify your payment. If someone is sending to your personal
                  Pilot wallet, they do not need a tag. You only need a tag when
                  sending to exchanges or services that ask for one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
