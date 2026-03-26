import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// EmptyState -- placeholder for empty lists / views
// ---------------------------------------------------------------------------

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon or illustration to display. */
  icon?: ReactNode;
  /** Title text. */
  title: string;
  /** Description text. */
  description?: string;
  /** Optional action element (e.g. a Button). */
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center px-6 py-16 text-center font-sans',
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-neutral-300 dark:text-neutral-600">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
          {title}
        </h3>

        {description && (
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}

        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
