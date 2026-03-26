import React, { useCallback, useState } from 'react';
import { useExtensionStore } from '../stores/extension';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute

export const Lock: React.FC = () => {
  const { unlock, setAddress } = useExtensionStore();
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState(0);
  const [error, setError] = useState('');

  const pinDots = Array.from({ length: 6 }, (_, i) => i < pin.length);

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (isLockedOut) return;
      if (pin.length >= 6) return;
      setPin((prev) => prev + digit);
      setError('');
    },
    [pin, isLockedOut],
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  }, []);

  const handleUnlock = useCallback(() => {
    if (isLockedOut) {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (remaining > 0) {
        setError(`Too many failed attempts. Try again in ${remaining} seconds.`);
        return;
      }
      setIsLockedOut(false);
      setFailedAttempts(0);
    }

    if (pin.length < 6) {
      setError('Enter your 6-digit PIN');
      return;
    }

    chrome.runtime.sendMessage(
      { type: 'UNLOCK', payload: { pin } },
      (response) => {
        if (chrome.runtime.lastError) {
          setError('Failed to communicate with wallet');
          return;
        }

        if (response?.error) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          setPin('');

          if (newAttempts >= MAX_ATTEMPTS) {
            setIsLockedOut(true);
            const end = Date.now() + LOCKOUT_DURATION_MS;
            setLockoutEnd(end);
            setError(`Too many failed attempts. Try again in 60 seconds.`);
          } else {
            setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
          }
          return;
        }

        if (response?.address) {
          setAddress(response.address as string);
        }
        setPin('');
        setFailedAttempts(0);
        unlock();
      },
    );
  }, [pin, failedAttempts, isLockedOut, lockoutEnd, unlock, setAddress]);

  const handleBiometrics = useCallback(() => {
    // Biometric auth would be implemented via platform-specific APIs
    // This is a placeholder for the UI option
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-pilot-primary/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-pilot-primary">P</span>
        </div>
      </div>

      <h1 className="text-xl font-bold text-pilot-text mb-2">Welcome back</h1>
      <p className="text-pilot-muted text-sm mb-8">Enter your PIN to unlock Pilot</p>

      {/* PIN dots */}
      <div className="flex gap-3 mb-6" role="status" aria-label={`${pin.length} of 6 digits entered`}>
        {pinDots.map((filled, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-colors ${
              filled ? 'bg-pilot-primary' : 'bg-pilot-border'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-pilot-danger text-sm text-center mb-4 px-4" role="alert">
          {error}
        </p>
      )}

      {/* Failed attempt counter */}
      {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && !error && (
        <p className="text-pilot-warning text-xs mb-4">
          {failedAttempts} failed {failedAttempts === 1 ? 'attempt' : 'attempts'}
        </p>
      )}

      {/* PIN keypad */}
      <div className="grid grid-cols-3 gap-2 mb-6 w-full max-w-[240px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handlePinDigit(digit)}
            disabled={isLockedOut}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-pilot-surface hover:bg-pilot-border text-pilot-text text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Digit ${digit}`}
          >
            {digit}
          </button>
        ))}
        <button
          onClick={handleBiometrics}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-pilot-surface hover:bg-pilot-border text-pilot-muted text-xs font-medium transition-colors"
          aria-label="Use biometrics"
        >
          Bio
        </button>
        <button
          onClick={() => handlePinDigit('0')}
          disabled={isLockedOut}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-pilot-surface hover:bg-pilot-border text-pilot-text text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Digit 0"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-pilot-surface hover:bg-pilot-border text-pilot-muted transition-colors"
          aria-label="Delete last digit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 4H8l-5 6 5 6h7a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8l-4 4M8 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Unlock button */}
      <button
        onClick={handleUnlock}
        disabled={pin.length < 6 || isLockedOut}
        className="w-full max-w-[240px] min-h-[44px] bg-pilot-primary hover:bg-pilot-secondary text-white font-medium rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Unlock wallet"
      >
        Unlock
      </button>
    </div>
  );
};
