import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// TransactionItem -- a single row in a transaction list
// ---------------------------------------------------------------------------

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionDirection = 'send' | 'receive';

export interface TransactionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Human-readable description of the transaction. */
  description: string;
  /** Amount displayed (already formatted string, e.g. "100.00"). */
  amount: string;
  /** Currency code (e.g. "XRP"). */
  currency?: string;
  /** Whether this is a send or receive (controls color). */
  direction: TransactionDirection;
  /** ISO timestamp or human-friendly string. */
  timestamp: string;
  /** Current status of the transaction. */
  status?: TransactionStatus;
  /** Called when the row is tapped/clicked. */
  onPress?: () => void;
}

export const TransactionItem = forwardRef<HTMLDivElement, TransactionItemProps>(
  (
    {
      className,
      description,
      amount,
      currency = 'XRP',
      direction,
      timestamp,
      status = 'confirmed',
      onPress,
      ...props
    },
    ref,
  ) => {
    const interactive = Boolean(onPress);

    return (
      <div
        ref={ref}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onPress}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPress?.();
                }
              }
            : undefined
        }
        className={cn(
          'flex items-center gap-4 px-4 py-3 min-h-tap font-sans',
          'rounded-lg',
          'transition-colors duration-fast',
          interactive && [
            'cursor-pointer',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800',
            'active:bg-neutral-100 dark:active:bg-neutral-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
          ],
          className,
        )}
        {...props}
      >
        {/* Direction icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            direction === 'receive'
              ? 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400'
              : 'bg-error-100 text-error-600 dark:bg-error-900 dark:text-error-400',
          )}
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            {direction === 'receive' ? (
              <path
                d="M9 3v12m0 0l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M9 15V3m0 0L5 7m4-4l4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>

        {/* Description & timestamp */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium text-neutral-900 dark:text-neutral-50">
            {description}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {timestamp}
          </span>
        </div>

        {/* Amount & status */}
        <div className="flex shrink-0 flex-col items-end">
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              direction === 'receive'
                ? 'text-success-600 dark:text-success-400'
                : 'text-error-600 dark:text-error-400',
            )}
          >
            {direction === 'receive' ? '+' : '-'}
            {amount} {currency}
          </span>

          {/* Status indicator */}
          <span
            className={cn(
              'mt-0.5 flex items-center gap-1 text-xs',
              status === 'confirmed' && 'text-success-600 dark:text-success-400',
              status === 'pending' && 'text-warning-600 dark:text-warning-400',
              status === 'failed' && 'text-error-600 dark:text-error-400',
            )}
          >
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                status === 'confirmed' && 'bg-success-500',
                status === 'pending' && 'bg-warning-500',
                status === 'failed' && 'bg-error-500',
              )}
              aria-hidden="true"
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    );
  },
);

TransactionItem.displayName = 'TransactionItem';
