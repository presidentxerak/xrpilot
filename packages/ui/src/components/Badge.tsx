import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Badge variants
// ---------------------------------------------------------------------------

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-sans font-medium',
    'rounded-full',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-neutral-100 text-neutral-700',
          'dark:bg-neutral-800 dark:text-neutral-300',
        ],
        success: [
          'bg-success-100 text-success-700',
          'dark:bg-success-900 dark:text-success-300',
        ],
        warning: [
          'bg-warning-100 text-warning-700',
          'dark:bg-warning-900 dark:text-warning-300',
        ],
        error: [
          'bg-error-100 text-error-700',
          'dark:bg-error-900 dark:text-error-300',
        ],
        info: [
          'bg-primary-100 text-primary-700',
          'dark:bg-primary-900 dark:text-primary-300',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

// ---------------------------------------------------------------------------
// Badge component
// ---------------------------------------------------------------------------

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export { badgeVariants };
