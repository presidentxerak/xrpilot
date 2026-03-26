import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Toast -- auto-dismissing notification
// ---------------------------------------------------------------------------

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Type determines the color scheme. */
  type?: ToastType;
  /** Message text. */
  message: string;
  /** Optional icon override. */
  icon?: ReactNode;
  /** Position on screen. */
  position?: ToastPosition;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss). Default: 4000. */
  duration?: number;
  /** Whether the toast is visible. */
  open: boolean;
  /** Called when the toast should be dismissed. */
  onClose: () => void;
}

const typeStyles: Record<ToastType, string> = {
  success:
    'bg-success-50 text-success-800 border-success-200 dark:bg-success-900 dark:text-success-200 dark:border-success-700',
  error:
    'bg-error-50 text-error-800 border-error-200 dark:bg-error-900 dark:text-error-200 dark:border-error-700',
  info: 'bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:border-primary-700',
  warning:
    'bg-warning-50 text-warning-800 border-warning-200 dark:bg-warning-900 dark:text-warning-200 dark:border-warning-700',
};

const defaultIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.5 5.5L7.75 14.25 3.5 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M10 6v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2L1 18h18L10 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      type = 'info',
      message,
      icon,
      position = 'top',
      duration = 4000,
      open,
      onClose,
      ...props
    },
    ref,
  ) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
      if (!open || duration === 0) return;
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(onClose, 200);
      }, duration);
      return () => clearTimeout(timer);
    }, [open, duration, onClose]);

    // Reset exit state when reopened
    useEffect(() => {
      if (open) setExiting(false);
    }, [open]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(
          'fixed left-4 right-4 z-[60] mx-auto max-w-md',
          position === 'top' ? 'top-4' : 'bottom-4',
          'flex items-center gap-3 rounded-xl border px-4 py-3',
          'font-sans text-sm font-medium',
          'shadow-elevated dark:shadow-elevated-dark',
          typeStyles[type],
          !exiting && (position === 'top' ? 'animate-toast-enter' : 'animate-toast-enter-bottom'),
          exiting && 'animate-toast-exit',
          className,
        )}
        {...props}
      >
        <span className="shrink-0">{icon ?? defaultIcons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={() => {
            setExiting(true);
            setTimeout(onClose, 200);
          }}
          aria-label="Dismiss notification"
          className={cn(
            'flex h-8 w-8 min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-lg',
            'hover:bg-black/5 dark:hover:bg-white/10',
            'transition-colors duration-fast',
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M11 3L3 11M3 3l8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    );
  },
);

Toast.displayName = 'Toast';
