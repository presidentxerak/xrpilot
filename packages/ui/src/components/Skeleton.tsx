import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Skeleton -- loading placeholder
// ---------------------------------------------------------------------------

const skeletonVariants = cva(
  [
    'animate-skeleton-pulse',
    'bg-neutral-200 dark:bg-neutral-700',
  ],
  {
    variants: {
      variant: {
        text: 'h-4 w-full rounded',
        card: 'h-48 w-full rounded-xl',
        avatar: 'rounded-full',
        list: 'h-16 w-full rounded-lg',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    compoundVariants: [
      { variant: 'avatar', size: 'sm', className: 'h-8 w-8' },
      { variant: 'avatar', size: 'md', className: 'h-11 w-11' },
      { variant: 'avatar', size: 'lg', className: 'h-14 w-14' },
      { variant: 'text', size: 'sm', className: 'h-3 w-3/4' },
      { variant: 'text', size: 'md', className: 'h-4 w-full' },
      { variant: 'text', size: 'lg', className: 'h-6 w-2/3' },
    ],
    defaultVariants: {
      variant: 'text',
      size: 'md',
    },
  },
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Number of skeleton rows to repeat (useful for list variant). */
  count?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, count = 1, ...props }, ref) => {
    if (count > 1) {
      return (
        <div ref={ref} className="flex flex-col gap-3" {...props}>
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              className={cn(skeletonVariants({ variant, size }), className)}
              aria-hidden="true"
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, size }), className)}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

export { skeletonVariants };
