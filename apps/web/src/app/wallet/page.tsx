'use client';

import Link from 'next/link';
import { useWalletStore } from '@/stores/wallet';

const features = [
  {
    icon: '📥',
    title: 'Receive Objects',
    description:
      'Get digital tickets, coupons, collectibles, and more. All in one place.',
  },
  {
    icon: '💸',
    title: 'Send Value',
    description:
      'Send payments to anyone, instantly. No waiting, no hidden fees.',
  },
  {
    icon: '🔒',
    title: 'Stay Secure',
    description:
      'Protected by your PIN and biometrics. Only you can access your wallet.',
  },
];

export default function WalletPage() {
  const hasWallet = useWalletStore((s) => s.accounts.length > 0);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-subtle to-surface px-6 pt-16 pb-20 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-white">
            P
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-content md:text-5xl">
            Your Digital Wallet
          </h1>

          <p className="mx-auto mb-8 max-w-lg text-lg text-content-secondary">
            A simple, secure place to hold your digital objects and send value
            to anyone. No complicated setup. Ready in 30 seconds.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {hasWallet ? (
              <Link href="/app" className="pilot-button-primary text-lg px-8 py-3">
                Open Your Wallet
              </Link>
            ) : (
              <Link
                href="/app/onboarding"
                className="pilot-button-primary text-lg px-8 py-3"
              >
                Create Your Wallet
              </Link>
            )}

            <Link
              href="/learn"
              className="pilot-button-secondary text-lg px-8 py-3"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Decorative background circles */}
        <div
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/5"
          aria-hidden
        />
        <div
          className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/5"
          aria-hidden
        />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-content">
          Everything you need, nothing you don&apos;t
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="pilot-card flex flex-col items-center text-center p-6"
            >
              <span className="mb-4 text-4xl" role="img" aria-label={feature.title}>
                {feature.icon}
              </span>
              <h3 className="mb-2 text-lg font-medium text-content">
                {feature.title}
              </h3>
              <p className="text-sm text-content-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-raised px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-content">
            Up and running in 30 seconds
          </h2>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Open Pilot',
                desc: 'Tap "Create Your Wallet" and you are on your way.',
              },
              {
                step: '2',
                title: 'Set a PIN',
                desc: 'Choose a 6-digit PIN to keep your wallet safe.',
              },
              {
                step: '3',
                title: 'You are ready',
                desc: 'Start receiving objects, sending payments, and more.',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-content">
                    {item.title}
                  </h3>
                  <p className="text-content-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embeddable CTA */}
      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-4 text-2xl font-bold text-content">
            Ready to get started?
          </h2>
          <p className="mb-8 text-content-secondary">
            Your wallet is free to create and always under your control.
          </p>
          <Link
            href={hasWallet ? '/app' : '/app/onboarding'}
            className="pilot-button-primary text-lg px-10 py-3"
          >
            {hasWallet ? 'Open Your Wallet' : 'Create Your Wallet'}
          </Link>
        </div>
      </section>
    </main>
  );
}
