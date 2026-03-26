import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Button variants via CVA
// ---------------------------------------------------------------------------

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-sans font-medium',
    'rounded-lg',
    'transition-colors duration-normal',
    'select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98] transition-transform',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600 text-white',
          'hover:bg-primary-700 active:bg-primary-800',
          'dark:bg-primary-500 dark:hover:bg-primary-400 dark:active:bg-primary-300 dark:text-neutral-950',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900',
          'border border-neutral-200',
          'hover:bg-neutral-200 active:bg-neutral-300',
          'dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700',
          'dark:hover:bg-neutral-700 dark:active:bg-neutral-600',
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100 active:bg-neutral-200',
          'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
        ],
        danger: [
          'bg-error-600 text-white',
          'hover:bg-error-700 active:bg-error-800',
          'dark:bg-error-500 dark:hover:bg-error-400 dark:active:bg-error-300 dark:text-neutral-950',
        ],
      },
      size: {
        sm: 'h-9 min-h-[36px] px-3 text-sm',
        md: 'h-11 min-h-tap px-5 text-base',
        lg: 'h-14 min-h-tap-lg px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spinner h-5 w-5', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Button component
// ---------------------------------------------------------------------------

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show a loading spinner and disable the button. */
  loading?: boolean;
  /** Content before the label. */
  leftIcon?: ReactNode;
  /** Content after the label. */
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
