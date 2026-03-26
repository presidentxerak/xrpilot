'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/stores/wallet';

type Step = 'welcome' | 'pin' | 'biometrics' | 'ready';

const steps: Step[] = ['welcome', 'pin', 'biometrics', 'ready'];

export default function OnboardingPage() {
  const router = useRouter();
  const setOnboarded = useWalletStore((s) => s.setOnboarded);
  const setAccounts = useWalletStore((s) => s.setAccounts);
  const setActiveAddress = useWalletStore((s) => s.setActiveAddress);

  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const stepIndex = steps.indexOf(currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const goNext = useCallback(() => {
    const next = steps[stepIndex + 1];
    if (next) setCurrentStep(next);
  }, [stepIndex]);

  const handleCreateWallet = async () => {
    setIsCreating(true);
    // Simulate wallet creation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockAddress = 'rPi1ot' + Math.random().toString(36).slice(2, 14);
    setAccounts([{ address: mockAddress, label: 'My Wallet', isActive: true }]);
    setActiveAddress(mockAddress);
    setIsCreating(false);
    goNext();
  };

  const handlePinSubmit = () => {
    setPinError('');
    if (pin.length !== 6) {
      setPinError('Please enter a 6-digit PIN.');
      return;
    }
    if (pin !== pinConfirm) {
      setPinError('PINs do not match. Try again.');
      return;
    }
    goNext();
  };

  const handleFinish = () => {
    setOnboarded(true);
    router.replace('/pilot/app');
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Progress Indicator */}
      <div className="w-full bg-surface-raised">
        <div
          className="h-1 bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Step 1: Welcome */}
          {currentStep === 'welcome' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl text-white font-bold">
                P
              </div>
              <h1 className="mb-3 text-3xl font-bold text-content">
                Welcome to Pilot
              </h1>
              <p className="mb-8 text-content-secondary leading-relaxed">
                Your personal digital wallet. Send and receive value, collect
                digital objects, and manage everything in one simple app.
              </p>
              <button
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="pilot-button-primary w-full py-3 text-lg disabled:opacity-60"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Setting up your wallet...
                  </span>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          )}

          {/* Step 2: PIN Setup */}
          {currentStep === 'pin' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-3xl">
                🔒
              </div>
              <h1 className="mb-2 text-2xl font-bold text-content">
                Secure your wallet
              </h1>
              <p className="mb-8 text-content-secondary">
                Choose a 6-digit PIN. You will use this to unlock your wallet and
                confirm actions.
              </p>

              <div className="w-full space-y-4">
                <div>
                  <label
                    htmlFor="pin"
                    className="mb-1.5 block text-left text-sm font-medium text-content"
                  >
                    Create a PIN
                  </label>
                  <input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="6-digit PIN"
                    className="pilot-input text-center text-2xl tracking-[0.5em]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pinConfirm"
                    className="mb-1.5 block text-left text-sm font-medium text-content"
                  >
                    Confirm your PIN
                  </label>
                  <input
                    id="pinConfirm"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinConfirm}
                    onChange={(e) =>
                      setPinConfirm(
                        e.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                    }
                    placeholder="Repeat PIN"
                    className="pilot-input text-center text-2xl tracking-[0.5em]"
                  />
                </div>

                {pinError && (
                  <p className="text-sm text-danger">{pinError}</p>
                )}

                <button
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 6 || pinConfirm.length !== 6}
                  className="pilot-button-primary w-full py-3 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Set PIN
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Biometrics (Optional) */}
          {currentStep === 'biometrics' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-3xl">
                👆
              </div>
              <h1 className="mb-2 text-2xl font-bold text-content">
                Enable quick unlock?
              </h1>
              <p className="mb-8 text-content-secondary">
                Use your fingerprint or face to open your wallet faster. You can
                always use your PIN instead.
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={goNext}
                  className="pilot-button-primary w-full py-3 text-lg"
                >
                  Enable Quick Unlock
                </button>
                <button
                  onClick={goNext}
                  className="pilot-button-secondary w-full py-3"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Ready */}
          {currentStep === 'ready' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-subtle text-4xl">
                &#10003;
              </div>
              <h1 className="mb-2 text-2xl font-bold text-content">
                You&apos;re all set!
              </h1>
              <p className="mb-8 text-content-secondary">
                Your wallet is ready to use. You can receive payments, collect
                digital objects, and send value to anyone.
              </p>

              <div className="mb-8 w-full rounded-xl bg-surface-raised p-5 border border-[var(--border)]">
                <p className="mb-1 text-xs text-content-tertiary">Your wallet</p>
                <p className="text-lg font-bold text-content">My Wallet</p>
                <p className="text-sm text-content-secondary">Ready to go</p>
              </div>

              <button
                onClick={handleFinish}
                className="pilot-button-primary w-full py-3 text-lg"
              >
                Open My Wallet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step Dots */}
      <div className="flex justify-center gap-2 pb-8">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              i <= stepIndex
                ? 'w-6 bg-accent'
                : 'w-2 bg-content-tertiary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
