'use client';

import { AppShell } from '@/components/layout/AppShell';

const explainers = [
  {
    question: 'What is a reserve?',
    answer:
      'Think of a reserve like a security deposit on an apartment. When you first set up your wallet, a small amount is set aside to keep your account active on the network. This amount stays in your wallet and is returned if you ever close the account. It costs about 10 XRP — once it is there, you do not need to think about it again.',
    icon: '🏦',
  },
  {
    question: 'What are trust lines?',
    answer:
      'When you see "Allow this token," you are creating a trust line. It is like opening a specific pocket in your wallet for a new type of currency or token. You choose exactly which tokens you want to accept — nothing gets added without your permission. Each trust line reserves a tiny amount to keep track of the connection.',
    icon: '🤝',
  },
  {
    question: 'What is a destination tag?',
    answer:
      'A destination tag is like an apartment number. Imagine sending a package to a large building — the building address gets it to the right place, but the apartment number tells the mailroom exactly which person should receive it. Some services share one address among many users, so they use a tag to know the payment is yours.',
    icon: '🏢',
  },
  {
    question: 'How do objects work?',
    answer:
      'Objects are digital items that live in your wallet — things like event tickets, loyalty coupons, membership passes, or collectibles. When someone creates an object for you, it is sent directly to your wallet. You can view it, use it, or transfer it to someone else. Each object is unique and verifiably yours.',
    icon: '📦',
  },
];

export default function LearnPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-content">
            How it all works
          </h1>
          <p className="text-content-secondary">
            Quick answers to common questions. No technical jargon, just plain
            explanations.
          </p>
        </div>

        {/* Explainer Cards */}
        <div className="space-y-4">
          {explainers.map((item) => (
            <div key={item.question} className="pilot-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle text-2xl">
                  {item.icon}
                </span>
                <h2 className="text-lg font-medium text-content">
                  {item.question}
                </h2>
              </div>
              <p className="text-content-secondary leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 rounded-xl bg-accent-subtle p-5 text-center">
          <p className="text-sm text-content-secondary">
            Have more questions? Pilot is designed to explain things as you go.
            Look for the{' '}
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs font-bold min-h-0 min-w-0">
              ?
            </span>{' '}
            icon throughout the app for helpful tips.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
