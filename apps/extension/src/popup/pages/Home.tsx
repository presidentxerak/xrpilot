import React, { useCallback, useEffect, useState } from 'react';
import { useExtensionStore } from '../stores/extension';

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export const Home: React.FC = () => {
  const { address, balance, connectedSite, navigate, setBalance } = useExtensionStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch latest balance from background
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response?.balance) {
        setBalance(response.balance);
      }
    });
  }, [setBalance]);

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in extension context
    }
  }, [address]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-pilot-text">Pilot</h1>
        <button
          onClick={() => navigate('settings')}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-pilot-surface transition-colors"
          aria-label="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-pilot-muted">
            <path
              d="M10 13a3 3 0 100-6 3 3 0 000 6z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M17.4 12.3a1.3 1.3 0 00.26 1.43l.05.05a1.58 1.58 0 11-2.24 2.24l-.05-.05a1.3 1.3 0 00-1.43-.26 1.3 1.3 0 00-.79 1.19v.14a1.58 1.58 0 11-3.16 0v-.07A1.3 1.3 0 009.25 15.8a1.3 1.3 0 00-1.43.26l-.05.05a1.58 1.58 0 11-2.24-2.24l.05-.05a1.3 1.3 0 00.26-1.43 1.3 1.3 0 00-1.19-.79h-.14a1.58 1.58 0 010-3.16h.07A1.3 1.3 0 005.8 7.65a1.3 1.3 0 00-.26-1.43l-.05-.05a1.58 1.58 0 112.24-2.24l.05.05a1.3 1.3 0 001.43.26h.06a1.3 1.3 0 00.79-1.19v-.14a1.58 1.58 0 013.16 0v.07a1.3 1.3 0 00.79 1.19 1.3 1.3 0 001.43-.26l.05-.05a1.58 1.58 0 112.24 2.24l-.05.05a1.3 1.3 0 00-.26 1.43v.06a1.3 1.3 0 001.19.79h.14a1.58 1.58 0 010 3.16h-.07a1.3 1.3 0 00-1.19.79z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>

      {/* Address */}
      <div className="flex items-center justify-center mb-2">
        <button
          onClick={handleCopyAddress}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pilot-surface hover:bg-pilot-border transition-colors min-h-[44px]"
          aria-label={copied ? 'Address copied' : 'Copy wallet address'}
        >
          <span className="text-sm text-pilot-muted font-mono">
            {address ? truncateAddress(address) : 'No account'}
          </span>
          <span className="text-xs text-pilot-muted">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>

      {/* Connected site indicator */}
      {connectedSite && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-pilot-success" aria-hidden="true" />
          <span className="text-xs text-pilot-muted">
            Connected to {connectedSite}
          </span>
        </div>
      )}

      {/* Balance */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <p className="text-pilot-muted text-sm mb-1">Balance</p>
        <p className="text-4xl font-bold text-pilot-text mb-1">
          {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })}
        </p>
        <p className="text-pilot-muted text-sm">XRP</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mt-auto">
        <button
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-pilot-primary hover:bg-pilot-secondary text-white font-medium rounded-lg py-3 transition-colors"
          aria-label="Send XRP"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M8 2L4 6M8 2l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Send
        </button>
        <button
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-pilot-surface hover:bg-pilot-border text-pilot-text font-medium rounded-lg py-3 border border-pilot-border transition-colors"
          aria-label="Receive XRP"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 14V2M8 14l-4-4M8 14l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Receive
        </button>
      </div>
    </div>
  );
};
