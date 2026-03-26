import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label above the input. */
  label?: string;
  /** Descriptive helper text below the input. */
  helperText?: string;
  /** Error message -- also sets aria-invalid. */
  error?: string;
  /** Type of the input field. */
  type?: 'text' | 'number' | 'password';
  /** Show a clear ("x") button when the field has a value. */
  clearable?: boolean;
  /** Called when the clear button is pressed. */
  onClear?: () => void;
  /** Optional icon/element rendered inside the left of the input. */
  leftAddon?: ReactNode;
  /** Optional icon/element rendered inside the right of the input. */
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      type = 'text',
      clearable = false,
      onClear,
      leftAddon,
      rightAddon,
      id: idProp,
      disabled,
      value,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);
    const showClear = clearable && value !== undefined && value !== '';

    return (
      <div className={cn('flex flex-col gap-1.5 font-sans', className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium leading-snug',
              'text-neutral-700 dark:text-neutral-300',
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-neutral-400 dark:text-neutral-500">
              {leftAddon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            value={value}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : null, helperText ? helperId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={cn(
              'w-full min-h-tap rounded-lg border bg-transparent px-4 py-3',
              'font-sans text-base leading-normal',
              'text-neutral-900 dark:text-neutral-50',
              'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
              'transition-colors duration-normal',
              'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError
                ? 'border-error-500 dark:border-error-400'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
              leftAddon && 'pl-10',
              (rightAddon || showClear) && 'pr-10',
            )}
            {...props}
          />

          {showClear && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear input"
              onClick={onClear}
              className={cn(
                'absolute right-3 flex h-6 w-6 items-center justify-center rounded-full',
                'text-neutral-400 hover:text-neutral-600',
                'dark:text-neutral-500 dark:hover:text-neutral-300',
                'transition-colors duration-fast',
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {!showClear && rightAddon && (
            <span className="pointer-events-none absolute right-3 flex items-center text-neutral-400 dark:text-neutral-500">
              {rightAddon}
            </span>
          )}
        </div>

        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-error-600 dark:text-error-400"
          >
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p
            id={helperId}
            className="text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
