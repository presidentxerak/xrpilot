import {
  forwardRef,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
  type HTMLAttributes,
} from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// PinInput -- 6-digit secure PIN entry
// ---------------------------------------------------------------------------

export interface PinInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value as a string of up to 6 digits. */
  value: string;
  /** Called with the new string value on every change. */
  onChange: (value: string) => void;
  /** Number of digits (default: 6). */
  length?: number;
  /** Whether to show an error shake animation. */
  error?: boolean;
  /** Disable the input. */
  disabled?: boolean;
  /** Called when all digits are filled. */
  onComplete?: (value: string) => void;
}

export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      className,
      value,
      onChange,
      length = 6,
      error = false,
      disabled = false,
      onComplete,
      ...props
    },
    ref,
  ) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.split('').slice(0, length);

    // Focus the appropriate input on mount or value change
    useEffect(() => {
      if (disabled) return;
      const nextEmpty = digits.length < length ? digits.length : length - 1;
      inputRefs.current[nextEmpty]?.focus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setDigit = useCallback(
      (index: number, digit: string) => {
        const arr = value.split('').slice(0, length);
        arr[index] = digit;
        const next = arr.join('');
        onChange(next);
        if (next.length === length) {
          onComplete?.(next);
        }
      },
      [value, length, onChange, onComplete],
    );

    const handleKeyDown = useCallback(
      (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
          e.preventDefault();
          if (digits[index]) {
            // Clear current digit
            const arr = value.split('').slice(0, length);
            arr[index] = '';
            // Remove trailing empty strings
            const trimmed = arr.join('').replace(/\s+$/, '');
            onChange(trimmed.slice(0, index) + trimmed.slice(index + 1));
          } else if (index > 0) {
            // Move to previous and clear it
            const arr = value.split('').slice(0, length);
            arr[index - 1] = '';
            onChange(arr.slice(0, index - 1).join(''));
            inputRefs.current[index - 1]?.focus();
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          e.preventDefault();
          inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
          e.preventDefault();
          inputRefs.current[index + 1]?.focus();
        } else if (/^\d$/.test(e.key)) {
          e.preventDefault();
          setDigit(index, e.key);
          if (index < length - 1) {
            inputRefs.current[index + 1]?.focus();
          }
        }
      },
      [digits, value, length, onChange, setDigit],
    );

    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData
          .getData('text/plain')
          .replace(/\D/g, '')
          .slice(0, length);
        if (pasted.length > 0) {
          onChange(pasted);
          if (pasted.length === length) {
            onComplete?.(pasted);
          } else {
            inputRefs.current[pasted.length]?.focus();
          }
        }
      },
      [length, onChange, onComplete],
    );

    return (
      <div
        ref={ref}
        role="group"
        aria-label="PIN entry"
        className={cn(
          'flex items-center justify-center gap-3 font-sans',
          error && 'animate-shake',
          className,
        )}
        {...props}
      >
        {Array.from({ length }, (_, i) => {
          const filled = i < digits.length && digits[i] !== '';
          return (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              value={filled ? '\u2022' : ''}
              aria-label={`Digit ${i + 1}`}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              readOnly
              className={cn(
                'h-14 w-11 min-h-tap min-w-tap',
                'rounded-lg border-2 text-center text-2xl font-bold',
                'bg-white dark:bg-neutral-900',
                'text-neutral-900 dark:text-neutral-50',
                'caret-transparent select-none',
                'transition-colors duration-fast',
                'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error
                  ? 'border-error-500 dark:border-error-400'
                  : filled
                    ? 'border-primary-500 dark:border-primary-400'
                    : 'border-neutral-200 dark:border-neutral-700',
              )}
            />
          );
        })}
      </div>
    );
  },
);

PinInput.displayName = 'PinInput';
