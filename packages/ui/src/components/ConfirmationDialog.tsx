import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn.js';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { AmountDisplay } from './AmountDisplay.js';

// ---------------------------------------------------------------------------
// ConfirmationDialog -- transaction confirmation modal
// ---------------------------------------------------------------------------

export interface ConfirmationDialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called when the dialog requests to close. */
  onClose: () => void;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Human-readable description of the action. */
  title: string;
  /** Additional detail about the transaction. */
  description?: string;
  /** Amount to display. */
  amount?: number | string;
  /** Currency code. */
  currency?: string;
  /** "After this, you will have X available" text. */
  balanceAfter?: string;
  /** Label for the confirm button (default: "Confirm"). */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel"). */
  cancelLabel?: string;
  /** Show loading state on confirm button. */
  loading?: boolean;
  /** Extra content between the amount and the action buttons. */
  children?: ReactNode;
}

export const ConfirmationDialog = forwardRef<
  HTMLDivElement,
  ConfirmationDialogProps
>(
  (
    {
      className,
      open,
      onClose,
      onConfirm,
      title,
      description,
      amount,
      currency = 'XRP',
      balanceAfter,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        title={title}
        description={description}
        closeOnOverlayClick={!loading}
        showCloseButton={!loading}
        className={className}
        {...props}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Amount */}
          {amount !== undefined && (
            <div className="flex flex-col items-center gap-1">
              <AmountDisplay
                amount={amount}
                currency={currency}
                size="lg"
                sign="negative"
                showSign
              />
            </div>
          )}

          {/* Balance after */}
          {balanceAfter && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              After this, you will have{' '}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {balanceAfter}
              </span>{' '}
              available
            </p>
          )}

          {/* Additional content */}
          {children}

          {/* Action buttons */}
          <div className="flex w-full flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
              aria-label={confirmLabel}
            >
              {confirmLabel}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={onClose}
              disabled={loading}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </Modal>
    );
  },
);

ConfirmationDialog.displayName = 'ConfirmationDialog';
