import {
  forwardRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal requests to close. */
  onClose: () => void;
  /** Title shown in the modal header. */
  title?: string;
  /** Optional description below the title. */
  description?: string;
  /** Content rendered inside the modal body. */
  children?: ReactNode;
  /** Whether clicking the overlay should close the modal (default: true). */
  closeOnOverlayClick?: boolean;
  /** Whether to show the close button (default: true). */
  showCloseButton?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      open,
      onClose,
      title,
      description,
      children,
      closeOnOverlayClick = true,
      showCloseButton = true,
      ...props
    },
    ref,
  ) => {
    // Escape key handler
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      },
      [onClose],
    );

    useEffect(() => {
      if (!open) return;
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = prev;
      };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'font-sans',
        )}
        role="presentation"
      >
        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0',
            'bg-black/40 dark:bg-black/70',
            'animate-fade-in',
          )}
          aria-hidden="true"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Dialog */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          aria-describedby={description ? 'modal-description' : undefined}
          className={cn(
            'relative z-10 w-full max-w-lg',
            'rounded-xl p-6',
            'bg-white dark:bg-neutral-900',
            'shadow-modal dark:shadow-modal-dark',
            'animate-fade-in',
            className,
          )}
          {...props}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4',
                'flex h-11 w-11 min-h-tap min-w-tap items-center justify-center rounded-lg',
                'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
                'dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800',
                'transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
              )}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {/* Header */}
          {title && (
            <h2 className="pr-10 text-xl font-bold leading-snug text-neutral-900 dark:text-neutral-50">
              {title}
            </h2>
          )}
          {description && (
            <p
              id="modal-description"
              className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
            >
              {description}
            </p>
          )}

          {/* Body */}
          <div className={cn((title || description) && 'mt-6')}>
            {children}
          </div>
        </div>
      </div>
    );
  },
);

Modal.displayName = 'Modal';
