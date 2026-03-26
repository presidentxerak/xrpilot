import React, { useCallback, useMemo } from 'react';
import { useExtensionStore } from '../stores/extension';
import { DomainBadge } from '../components/DomainBadge';

// Known verified domains for anti-phishing
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

export const Approve: React.FC = () => {
  const { pendingRequest, navigate, setPendingRequest } = useExtensionStore();
  const origin = pendingRequest?.origin ?? '';
  const domain = extractDomain(origin);
  const trustLevel = useMemo(() => assessTrustLevel(origin), [origin]);

  const handleApprove = useCallback(() => {
    chrome.runtime.sendMessage(
      { type: 'APPROVE_REQUEST', payload: { id: (pendingRequest?.data as { id?: string })?.id } },
      () => {
        setPendingRequest(null);
        navigate('home');
      },
    );
  }, [pendingRequest, setPendingRequest, navigate]);

  const handleDeny = useCallback(() => {
    chrome.runtime.sendMessage(
      { type: 'REJECT_REQUEST', payload: { id: (pendingRequest?.data as { id?: string })?.id } },
      () => {
        setPendingRequest(null);
        navigate('home');
      },
    );
  }, [pendingRequest, setPendingRequest, navigate]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="text-center mb-6 pt-4">
        <h1 className="text-xl font-bold text-pilot-text mb-2">
          Connect to site?
        </h1>
        <p className="text-pilot-muted text-sm">
          This site wants to connect to your Pilot wallet
        </p>
      </div>

      {/* Domain display - anti-phishing: domain shown prominently */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <p className="text-2xl font-bold text-pilot-text text-center break-all px-4">
          {domain}
        </p>
        <DomainBadge domain={domain} trustLevel={trustLevel} fullUrl={origin} />
      </div>

      {/* Suspicious site warning */}
      {trustLevel === 'suspicious' && (
        <div className="flex items-start gap-3 px-4 py-3 bg-pilot-danger/20 border border-pilot-danger/40 rounded-lg mb-4 min-h-[44px]">
          <span className="text-pilot-danger text-lg mt-0.5" aria-hidden="true">{'\u26D4'}</span>
          <div>
            <p className="text-pilot-danger text-sm font-medium">
              This site looks suspicious
            </p>
            <p className="text-pilot-danger/80 text-xs mt-1">
              Be cautious. This domain matches patterns commonly used in phishing attacks.
            </p>
          </div>
        </div>
      )}

      {/* Permissions */}
      <div className="bg-pilot-surface border border-pilot-border rounded-lg p-4 mb-6">
        <p className="text-pilot-muted text-xs uppercase tracking-wide mb-3">
          Permissions requested
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-pilot-text">
            <span className="text-pilot-muted" aria-hidden="true">{'\u2022'}</span>
            View your wallet address
          </li>
          <li className="flex items-center gap-2 text-sm text-pilot-text">
            <span className="text-pilot-muted" aria-hidden="true">{'\u2022'}</span>
            Request transaction signatures
          </li>
          <li className="flex items-center gap-2 text-sm text-pilot-text">
            <span className="text-pilot-muted" aria-hidden="true">{'\u2022'}</span>
            View your account balance
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={handleDeny}
          className="flex-1 min-h-[44px] bg-pilot-danger/20 hover:bg-pilot-danger/30 text-pilot-danger font-medium rounded-lg py-3 transition-colors border border-pilot-danger/40"
          aria-label="Deny connection"
        >
          Deny
        </button>
        <button
          onClick={handleApprove}
          className="flex-1 min-h-[44px] bg-pilot-success hover:bg-pilot-success/80 text-white font-medium rounded-lg py-3 transition-colors"
          aria-label="Approve connection"
        >
          Approve
        </button>
      </div>
    </div>
  );
};
