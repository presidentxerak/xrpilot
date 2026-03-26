'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWalletStore } from '@/stores/wallet';

export function useSession() {
  const isLocked = useWalletStore((s) => s.isLocked);
  const lock = useWalletStore((s) => s.lock);
  const unlock = useWalletStore((s) => s.unlock);

  return {
    isLocked,
    lock,
    unlock,
  };
}

export function useRequireAuth() {
  const { isLocked } = useSession();

  const requireAuth = useCallback(
    async (action?: string): Promise<boolean> => {
      // In production, this would trigger PIN or biometric verification
      // via @pilot/security before allowing sensitive actions.
      // For now, resolve immediately if unlocked.
      if (!isLocked) {
        return true;
      }

      // When locked, the UI would present a PIN entry overlay.
      // Return false to indicate auth was not completed.
      return false;
    },
    [isLocked]
  );

  return requireAuth;
}

type PinStep = 'idle' | 'enter' | 'confirm' | 'complete' | 'error';

export function usePinSetup() {
  const [step, setStep] = useState<PinStep>('idle');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const start = useCallback(() => {
    setStep('enter');
    setPin('');
    setConfirmPin('');
    setError('');
  }, []);

  const submitPin = useCallback(
    (value: string) => {
      if (step === 'enter') {
        if (value.length !== 6) {
          setError('PIN must be 6 digits.');
          return;
        }
        setPin(value);
        setError('');
        setStep('confirm');
      } else if (step === 'confirm') {
        if (value !== pin) {
          setError('PINs do not match. Try again.');
          setConfirmPin('');
          setStep('enter');
          setPin('');
          return;
        }
        setConfirmPin(value);
        setError('');
        setStep('complete');
      }
    },
    [step, pin]
  );

  const reset = useCallback(() => {
    setStep('idle');
    setPin('');
    setConfirmPin('');
    setError('');
  }, []);

  return {
    step,
    error,
    start,
    submitPin,
    reset,
    isComplete: step === 'complete',
  };
}
