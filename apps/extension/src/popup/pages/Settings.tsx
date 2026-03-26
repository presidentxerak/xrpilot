import React, { useCallback, useEffect, useState } from 'react';
import { useExtensionStore } from '../stores/extension';

interface ConnectionEntry {
  origin: string;
  approvedAt: number;
  permissions: string[];
}

const AUTO_LOCK_OPTIONS = [
  { label: '5 minutes', value: 5 * 60 * 1000 },
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
];

const NETWORKS = [
  { label: 'Mainnet', value: 'mainnet' },
  { label: 'Testnet', value: 'testnet' },
];

export const Settings: React.FC = () => {
  const { navigate, lock } = useExtensionStore();
  const [connections, setConnections] = useState<ConnectionEntry[]>([]);
  const [autoLock, setAutoLock] = useState(15 * 60 * 1000);
  const [network, setNetwork] = useState('mainnet');

  useEffect(() => {
    // Load connections
    chrome.runtime.sendMessage({ type: 'GET_CONNECTIONS' }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response?.connections) {
        setConnections(response.connections as ConnectionEntry[]);
      }
    });

    // Load state
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response?.network) {
        setNetwork(response.network as string);
      }
    });
  }, []);

  const handleRevoke = useCallback((origin: string) => {
    chrome.runtime.sendMessage(
      { type: 'REVOKE_CONNECTION', payload: { origin } },
      (response) => {
        if (response?.success) {
          setConnections((prev) => prev.filter((c) => c.origin !== origin));
        }
      },
    );
  }, []);

  const handleAutoLockChange = useCallback((duration: number) => {
    setAutoLock(duration);
    chrome.runtime.sendMessage({ type: 'SET_AUTO_LOCK', payload: { duration } });
  }, []);

  const handleNetworkChange = useCallback((newNetwork: string) => {
    setNetwork(newNetwork);
    chrome.runtime.sendMessage({ type: 'SET_NETWORK', payload: { network: newNetwork } });
  }, []);

  const handleLock = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'LOCK' }, () => {
      lock();
    });
  }, [lock]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-pilot-border">
        <button
          onClick={() => navigate('home')}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-pilot-surface transition-colors"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pilot-text" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-pilot-text">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Connected sites */}
        <section>
          <h2 className="text-pilot-muted text-xs uppercase tracking-wide mb-3">
            Connected sites
          </h2>
          {connections.length === 0 ? (
            <p className="text-pilot-muted text-sm py-3">No connected sites</p>
          ) : (
            <ul className="space-y-2">
              {connections.map((conn) => (
                <li
                  key={conn.origin}
                  className="flex items-center justify-between bg-pilot-surface border border-pilot-border rounded-lg px-3 py-2 min-h-[44px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-pilot-success flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-pilot-text truncate">
                      {conn.origin}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRevoke(conn.origin)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-pilot-danger text-xs font-medium hover:bg-pilot-danger/10 rounded-lg transition-colors flex-shrink-0"
                    aria-label={`Revoke connection to ${conn.origin}`}
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Auto-lock timer */}
        <section>
          <h2 className="text-pilot-muted text-xs uppercase tracking-wide mb-3">
            Auto-lock timer
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {AUTO_LOCK_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAutoLockChange(option.value)}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  autoLock === option.value
                    ? 'bg-pilot-primary/20 border-pilot-primary text-pilot-primary'
                    : 'bg-pilot-surface border-pilot-border text-pilot-text hover:bg-pilot-border'
                }`}
                aria-pressed={autoLock === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Network selector */}
        <section>
          <h2 className="text-pilot-muted text-xs uppercase tracking-wide mb-3">
            Network
          </h2>
          <div className="flex gap-2">
            {NETWORKS.map((net) => (
              <button
                key={net.value}
                onClick={() => handleNetworkChange(net.value)}
                className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  network === net.value
                    ? 'bg-pilot-primary/20 border-pilot-primary text-pilot-primary'
                    : 'bg-pilot-surface border-pilot-border text-pilot-text hover:bg-pilot-border'
                }`}
                aria-pressed={network === net.value}
              >
                {net.label}
              </button>
            ))}
          </div>
        </section>

        {/* Lock wallet */}
        <section>
          <button
            onClick={handleLock}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-pilot-surface hover:bg-pilot-border border border-pilot-border text-pilot-text font-medium rounded-lg py-3 transition-colors"
            aria-label="Lock wallet"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Lock wallet
          </button>
        </section>

        {/* Version info */}
        <div className="text-center pt-2 pb-4">
          <p className="text-pilot-muted text-xs">Pilot Wallet v0.1.0</p>
        </div>
      </div>
    </div>
  );
};
