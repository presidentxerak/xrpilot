'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';

const autoLockOptions = [
  { label: '1 minute', value: 1 },
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
];

interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  detail: string;
}

const mockAuditLog: AuditEntry[] = [
  {
    id: '1',
    action: 'Wallet unlocked',
    timestamp: new Date().toISOString(),
    detail: 'PIN authentication',
  },
  {
    id: '2',
    action: 'Payment sent',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    detail: 'Authorized via PIN',
  },
];

const mockConnectedSites = [
  { origin: 'example-dex.com', connectedAt: '2026-03-20' },
  { origin: 'nft-marketplace.io', connectedAt: '2026-03-18' },
];

export default function SecurityPage() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLock, setAutoLock] = useState(5);
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [showExportWarning, setShowExportWarning] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-content">Security</h1>

        {/* PIN Management */}
        <section className="mb-6">
          <h2 className="pilot-section-title">Access</h2>
          <div className="pilot-card p-0 divide-y divide-[var(--border)]">
            <button
              onClick={() => setShowChangePIN(!showChangePIN)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-content">Change PIN</p>
                <p className="text-xs text-content-tertiary">
                  Update your 6-digit security PIN
                </p>
              </div>
              <span className="text-content-tertiary">&rsaquo;</span>
            </button>

            {showChangePIN && (
              <div className="space-y-3 p-4">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Current PIN"
                  className="pilot-input"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="New PIN"
                  className="pilot-input"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm New PIN"
                  className="pilot-input"
                />
                {newPin.length === 6 &&
                  confirmPin.length === 6 &&
                  newPin !== confirmPin && (
                    <p className="text-sm text-danger">PINs do not match.</p>
                  )}
                <button
                  disabled={
                    currentPin.length !== 6 ||
                    newPin.length !== 6 ||
                    newPin !== confirmPin
                  }
                  className="pilot-button-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update PIN
                </button>
              </div>
            )}

            {/* Biometric Toggle */}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-content">Quick Unlock</p>
                <p className="text-xs text-content-tertiary">
                  Use fingerprint or face to unlock
                </p>
              </div>
              <button
                role="switch"
                aria-checked={biometricEnabled}
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors min-h-0 min-w-0 ${
                  biometricEnabled ? 'bg-accent' : 'bg-content-tertiary/30'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto-lock Timer */}
            <div className="p-4">
              <p className="mb-3 text-sm font-medium text-content">
                Auto-lock after
              </p>
              <div className="grid grid-cols-4 gap-2">
                {autoLockOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAutoLock(opt.value)}
                    className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                      autoLock === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-surface-raised text-content-secondary hover:bg-accent-subtle'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Export Key */}
        <section className="mb-6">
          <h2 className="pilot-section-title">Backup</h2>
          <div className="pilot-card p-0">
            <button
              onClick={() => setShowExportWarning(!showExportWarning)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-content">
                  Export Recovery Key
                </p>
                <p className="text-xs text-content-tertiary">
                  Save your key to restore your wallet on another device
                </p>
              </div>
              <span className="text-content-tertiary">&rsaquo;</span>
            </button>

            {showExportWarning && (
              <div className="border-t border-[var(--border)] p-4">
                <div className="mb-4 rounded-xl bg-danger-subtle p-4">
                  <p className="mb-2 text-sm font-medium text-danger">
                    Keep this key private
                  </p>
                  <p className="text-xs text-content-secondary">
                    Anyone who has your recovery key can access your wallet and
                    everything in it. Never share it with anyone. Never enter it on
                    a website. Write it down and store it somewhere safe.
                  </p>
                </div>
                <button className="pilot-button-primary w-full py-3">
                  I understand, show my key
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Connected Sites */}
        <section className="mb-6">
          <h2 className="pilot-section-title">Connected Sites</h2>
          {mockConnectedSites.length > 0 ? (
            <div className="pilot-card p-0 divide-y divide-[var(--border)]">
              {mockConnectedSites.map((site) => (
                <div
                  key={site.origin}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-content">
                      {site.origin}
                    </p>
                    <p className="text-xs text-content-tertiary">
                      Connected {site.connectedAt}
                    </p>
                  </div>
                  <button className="text-sm font-medium text-danger min-h-0 min-w-0 px-3 py-1">
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="pilot-card py-6 text-center">
              <p className="text-content-secondary">No connected sites.</p>
            </div>
          )}
        </section>

        {/* Security Audit Log */}
        <section>
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="flex w-full items-center justify-between mb-3"
          >
            <h2 className="pilot-section-title mb-0">Security Log</h2>
            <span
              className={`text-content-tertiary transition-transform duration-200 ${
                showAuditLog ? 'rotate-180' : ''
              }`}
            >
              &#9660;
            </span>
          </button>

          {showAuditLog && (
            <div className="pilot-card p-0 divide-y divide-[var(--border)]">
              {mockAuditLog.map((entry) => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-content">
                      {entry.action}
                    </p>
                    <p className="text-xs text-content-tertiary">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-content-tertiary">{entry.detail}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
