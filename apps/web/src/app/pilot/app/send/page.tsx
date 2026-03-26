'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/stores/wallet';
import { useBalance, useSendXrp } from '@/hooks/useWallet';
import { useRequireAuth } from '@/hooks/useSecurity';
import { AppShell } from '@/components/layout/AppShell';

type SendStep = 'form' | 'confirm' | 'auth' | 'sending' | 'success' | 'error';

export default function SendPage() {
  const router = useRouter();
  const activeAccount = useWalletStore((s) => s.activeAccount);
  const address = activeAccount?.address ?? '';
  const { data: balance } = useBalance(address);
  const sendXrp = useSendXrp();
  const requireAuth = useRequireAuth();

  const [step, setStep] = useState<SendStep>('form');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [showTagInfo, setShowTagInfo] = useState(false);
  const [error, setError] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const availableBalance = balance ?? 0;
  const remainingBalance = availableBalance - numericAmount;

  const canSend =
    recipient.trim().length > 0 &&
    numericAmount > 0 &&
    numericAmount <= availableBalance;

  const handleReview = () => {
    if (!canSend) return;
    setStep('confirm');
  };

  const handleConfirmAndSend = async () => {
    setStep('auth');
    try {
      const authorized = await requireAuth('send');
      if (!authorized) {
        setStep('confirm');
        return;
      }

      setStep('sending');
      await sendXrp.mutateAsync({
        from: address,
        to: recipient.trim(),
        amount: numericAmount,
        destinationTag: destinationTag ? parseInt(destinationTag, 10) : undefined,
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStep('error');
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => (step === 'form' ? router.back() : setStep('form'))}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-raised"
            aria-label="Go back"
          >
            <span className="text-xl">&larr;</span>
          </button>
          <h1 className="text-xl font-bold text-content">Send</h1>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-5 animate-fade-in">
            {/* Recipient */}
            <div>
              <label
                htmlFor="recipient"
                className="mb-1.5 block text-sm font-medium text-content"
              >
                Send to
              </label>
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient address"
                className="pilot-input"
                autoComplete="off"
              />
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-1.5 block text-sm font-medium text-content"
              >
                Amount
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pilot-input pr-16 text-2xl font-bold"
                  min="0"
                  step="any"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-content-tertiary font-medium">
                  XRP
                </span>
              </div>
              <p className="mt-1.5 text-sm text-content-tertiary">
                Available: {availableBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} XRP
              </p>
              {numericAmount > availableBalance && (
                <p className="mt-1 text-sm text-danger">
                  You do not have enough to send this amount.
                </p>
              )}
            </div>

            {/* Destination Tag */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <label
                  htmlFor="tag"
                  className="block text-sm font-medium text-content"
                >
                  Memo / Tag (optional)
                </label>
                <button
                  onClick={() => setShowTagInfo(!showTagInfo)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-subtle text-accent text-xs min-h-0 min-w-0"
                  aria-label="What is a memo or tag?"
                >
                  ?
                </button>
              </div>
              {showTagInfo && (
                <p className="mb-2 rounded-lg bg-accent-subtle p-3 text-sm text-content-secondary">
                  Some services ask you to include a number so they know the
                  payment is from you. If you are sending to a friend, you can
                  leave this blank.
                </p>
              )}
              <input
                id="tag"
                type="number"
                inputMode="numeric"
                value={destinationTag}
                onChange={(e) => setDestinationTag(e.target.value)}
                placeholder="Optional"
                className="pilot-input"
              />
            </div>

            <button
              onClick={handleReview}
              disabled={!canSend}
              className="pilot-button-primary w-full py-3 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review
            </button>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pilot-card p-6 text-center">
              <p className="text-content-secondary mb-2">You are sending</p>
              <p className="text-4xl font-bold text-content mb-1">
                {numericAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} XRP
              </p>
              <p className="text-sm text-content-tertiary mb-4">
                to {recipient.slice(0, 8)}...{recipient.slice(-6)}
              </p>

              {destinationTag && (
                <p className="text-sm text-content-secondary">
                  Tag: {destinationTag}
                </p>
              )}
            </div>

            <div className="pilot-card p-4">
              <div className="flex justify-between text-sm">
                <span className="text-content-secondary">
                  After this, you will have
                </span>
                <span className="font-medium text-content">
                  {remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} XRP
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmAndSend}
                className="pilot-button-primary w-full py-3 text-lg"
              >
                Confirm and Send
              </button>
              <button
                onClick={() => setStep('form')}
                className="pilot-button-secondary w-full py-3"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Auth Step */}
        {step === 'auth' && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4" />
            <p className="text-content-secondary">Verifying your identity...</p>
          </div>
        )}

        {/* Sending Step */}
        {step === 'sending' && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4" />
            <p className="text-content-secondary">Sending your payment...</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle text-success text-3xl">
              &#10003;
            </div>
            <h2 className="mb-2 text-2xl font-bold text-content">Sent!</h2>
            <p className="mb-8 text-content-secondary">
              {numericAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} XRP has been sent
              successfully.
            </p>
            <button
              onClick={() => router.push('/pilot/app')}
              className="pilot-button-primary px-8 py-3"
            >
              Back to Wallet
            </button>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-subtle text-danger text-3xl">
              !
            </div>
            <h2 className="mb-2 text-2xl font-bold text-content">
              Something went wrong
            </h2>
            <p className="mb-8 text-content-secondary">{error}</p>
            <button
              onClick={() => setStep('form')}
              className="pilot-button-primary px-8 py-3"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
