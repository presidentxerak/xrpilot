import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Card variants
// ---------------------------------------------------------------------------

const cardVariants = cva(
  [
    'rounded-xl font-sans',
    'text-neutral-900 dark:text-neutral-50',
    'transition-shadow duration-normal',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white dark:bg-neutral-900',
          'shadow-card dark:shadow-card-dark',
        ],
        elevated: [
          'bg-white dark:bg-neutral-900',
          'shadow-elevated dark:shadow-elevated-dark',
        ],
        outlined: [
          'bg-white dark:bg-neutral-900',
          'border border-neutral-200 dark:border-neutral-700',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Header content rendered above children. */
  header?: ReactNode;
  /** Footer content rendered below children. */
  footer?: ReactNode;
  /** If provided the card becomes a clickable button-like element. */
  onPress?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      header,
      footer,
      onPress,
      children,
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
        aria-label={interactive ? (props['aria-label'] ?? 'Card action') : undefined}
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
          cardVariants({ variant, padding }),
          interactive && [
            'cursor-pointer',
            'hover:shadow-elevated dark:hover:shadow-elevated-dark',
            'active:scale-[0.99] transition-transform',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
          ],
          className,
        )}
        {...props}
      >
        {header && (
          <div className="mb-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            {header}
          </div>
        )}
        {children}
        {footer && (
          <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';

export { cardVariants };
