import React, { useCallback, useMemo, useState } from 'react';
import { useExtensionStore } from '../stores/extension';
import { DomainBadge } from '../components/DomainBadge';
import { TransactionPreview } from '../components/TransactionPreview';

const VERIFIED_DOMAINS = [
  'xrpl.org',
  'xrplorer.com',
  'bithomp.com',
  'xrpscan.com',
];

const SUSPICIOUS_PATTERNS = [
  /xrpl.*login/i,
  /wallet.*verify/i,
  /claim.*airdrop/i,
  /free.*xrp/i,
];

type TrustLevel = 'verified' | 'unknown' | 'suspicious';

function assessTrustLevel(origin: string): TrustLevel {
  try {
    const hostname = new URL(origin).hostname;
    if (VERIFIED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      return 'verified';
    }
    if (SUSPICIOUS_PATTERNS.some((p) => p.test(origin))) {
      return 'suspicious';
    }
  } catch {
    return 'suspicious';
  }
  return 'unknown';
}

function extractDomain(origin: string): string {
  try {
    return new URL(origin).hostname;
  } catch {
    return origin;
  }
}

export const SignTransaction: React.FC = () => {
  const { pendingRequest, navigate, setPendingRequest } = useExtensionStore();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const origin = pendingRequest?.origin ?? '';
  const domain = extractDomain(origin);
  const trustLevel = useMemo(() => assessTrustLevel(origin), [origin]);
  const transaction = (pendingRequest?.data as { transaction?: Record<string, unknown> })?.transaction ?? {};

  const handleConfirm = useCallback(() => {
    if (pin.length < 6) {
      setPinError(true);
      return;
    }

    setPinError(false);
    chrome.runtime.sendMessage(
      { type: 'APPROVE_REQUEST', payload: { id: (pendingRequest?.data as { id?: string })?.id, pin } },
      (response) => {
        if (response?.error) {
          setPinError(true);
          return;
        }
        setPendingRequest(null);
        navigate('home');
      },
    );
  }, [pin, pendingRequest, setPendingRequest, navigate]);

  const handleReject = useCallback(() => {
    chrome.runtime.sendMessage(
      { type: 'REJECT_REQUEST', payload: { id: (pendingRequest?.data as { id?: string })?.id } },
      () => {
        setPendingRequest(null);
        navigate('home');
      },
    );
  }, [pendingRequest, setPendingRequest, navigate]);

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-4 pt-2">
        <h1 className="text-xl font-bold text-pilot-text mb-1">
          Sign transaction
        </h1>
        <p className="text-pilot-muted text-sm">
          Review the details before signing
        </p>
      </div>

      {/* Requesting domain */}
      <div className="flex justify-center mb-4">
        <DomainBadge domain={domain} trustLevel={trustLevel} fullUrl={origin} />
      </div>

      {/* Warning for unknown/suspicious sites */}
      {trustLevel !== 'verified' && (
        <div className="flex items-start gap-3 px-4 py-3 bg-pilot-warning/20 border border-pilot-warning/40 rounded-lg mb-4 min-h-[44px]">
          <span className="text-pilot-warning text-lg mt-0.5" aria-hidden="true">{'\u26A0'}</span>
          <div>
            <p className="text-pilot-warning text-sm font-medium">
              {trustLevel === 'suspicious'
                ? 'This site looks suspicious. Do not sign unless you are certain.'
                : 'This site has not been verified. Proceed with caution.'}
            </p>
          </div>
        </div>
      )}

      {/* Transaction preview */}
      <div className="mb-4">
        <TransactionPreview transaction={transaction} />
      </div>

      {/* PIN input */}
      <div className="mb-4">
        <label htmlFor="pin-input" className="block text-pilot-muted text-xs uppercase tracking-wide mb-2">
          Enter PIN to confirm
        </label>
        <input
          id="pin-input"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
            setPinError(false);
          }}
          placeholder="6-digit PIN"
          className={`w-full min-h-[44px] px-4 py-3 bg-pilot-surface border rounded-lg text-center text-lg font-mono tracking-[0.5em] text-pilot-text placeholder-pilot-muted/50 focus:outline-none focus:ring-2 focus:ring-pilot-primary ${
            pinError ? 'border-pilot-danger' : 'border-pilot-border'
          }`}
          autoComplete="off"
        />
        {pinError && (
          <p className="text-pilot-danger text-xs mt-1">
            Invalid PIN. Please try again.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={handleReject}
          className="flex-1 min-h-[44px] bg-pilot-danger/20 hover:bg-pilot-danger/30 text-pilot-danger font-medium rounded-lg py-3 transition-colors border border-pilot-danger/40"
          aria-label="Reject transaction"
        >
          Reject
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 min-h-[44px] bg-pilot-primary hover:bg-pilot-secondary text-white font-medium rounded-lg py-3 transition-colors"
          aria-label="Confirm and sign transaction"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
