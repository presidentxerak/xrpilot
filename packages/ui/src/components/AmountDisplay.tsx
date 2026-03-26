import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// AmountDisplay component -- large readable XRP/token amounts
// ---------------------------------------------------------------------------

export interface AmountDisplayProps extends HTMLAttributes<HTMLDivElement> {
  /** Numeric amount to display. */
  amount: number | string;
  /** Currency code or symbol (e.g. "XRP", "USD"). */
  currency?: string;
  /** Optional fiat equivalent string (e.g. "$12.34 USD"). */
  fiatEquivalent?: string;
  /** Sign display: positive amounts green, negative red, neutral default. */
  sign?: 'positive' | 'negative' | 'neutral';
  /** Size of the amount text. */
  size?: 'sm' | 'md' | 'lg';
  /** Show a + or - prefix. */
  showSign?: boolean;
}

export const AmountDisplay = forwardRef<HTMLDivElement, AmountDisplayProps>(
  (
    {
      className,
      amount,
      currency,
      fiatEquivalent,
      sign = 'neutral',
      size = 'md',
      showSign = false,
      ...props
    },
    ref,
  ) => {
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = formatAmount(numericAmount);
    const prefix =
      showSign && sign === 'positive'
        ? '+'
        : showSign && sign === 'negative'
          ? '-'
          : '';

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col font-sans', className)}
        {...props}
      >
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'font-bold tabular-nums tracking-tight',
              size === 'sm' && 'text-lg',
              size === 'md' && 'text-2xl',
              size === 'lg' && 'text-4xl',
              sign === 'positive' && 'text-success-600 dark:text-success-400',
              sign === 'negative' && 'text-error-600 dark:text-error-400',
              sign === 'neutral' &&
                'text-neutral-900 dark:text-neutral-50',
            )}
          >
            {prefix}
            {formatted}
          </span>

          {currency && (
            <span
              className={cn(
                'font-medium uppercase tracking-wide',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                'text-neutral-500 dark:text-neutral-400',
              )}
            >
              {currency}
            </span>
          )}
        </div>

        {fiatEquivalent && (
          <span className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {fiatEquivalent}
          </span>
        )}
      </div>
    );
  },
);

AmountDisplay.displayName = 'AmountDisplay';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a number for display with appropriate decimal places.
 * Uses locale formatting with commas / periods.
 */
function formatAmount(n: number): string {
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  // For very small amounts show more decimals
  if (abs < 0.001) return abs.toFixed(6);
  if (abs < 1) return abs.toFixed(4);
  if (abs < 1000) return abs.toFixed(2);
  return abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
