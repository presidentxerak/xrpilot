import {
  forwardRef,
  useEffect,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// BottomSheet -- mobile slide-up sheet with drag handle & snap points
// ---------------------------------------------------------------------------

export interface BottomSheetProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the sheet is visible. */
  open: boolean;
  /** Called when the sheet requests to close. */
  onClose: () => void;
  /** Sheet content. */
  children?: ReactNode;
  /** Title rendered in the sheet header. */
  title?: string;
  /**
   * Snap points as fractions of viewport height (0-1).
   * Defaults to [0.5, 0.92]. The sheet opens to the first snap point.
   */
  snapPoints?: number[];
}

export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (
    {
      className,
      open,
      onClose,
      children,
      title,
      snapPoints = [0.5, 0.92],
      ...props
    },
    ref,
  ) => {
    const [snapIndex, setSnapIndex] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStartY = useRef<number | null>(null);
    const dragCurrentY = useRef<number>(0);

    // Escape key
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      },
      [onClose],
    );

    useEffect(() => {
      if (!open) {
        setSnapIndex(0);
        return;
      }
      document.addEventListener('keydown', handleKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = prev;
      };
    }, [open, handleKeyDown]);

    // Drag handling
    const handlePointerDown = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        dragStartY.current = e.clientY;
        dragCurrentY.current = e.clientY;
      },
      [],
    );

    const handlePointerMove = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        if (dragStartY.current === null) return;
        dragCurrentY.current = e.clientY;
      },
      [],
    );

    const handlePointerUp = useCallback(() => {
      if (dragStartY.current === null) return;
      const delta = dragCurrentY.current - dragStartY.current;
      dragStartY.current = null;

      // Swipe down past threshold -> close or snap to lower point
      if (delta > 80) {
        if (snapIndex > 0) {
          setSnapIndex(snapIndex - 1);
        } else {
          onClose();
        }
      }
      // Swipe up past threshold -> snap to higher point
      else if (delta < -80 && snapIndex < snapPoints.length - 1) {
        setSnapIndex(snapIndex + 1);
      }
    }, [snapIndex, snapPoints, onClose]);

    if (!open) return null;

    const currentSnap = snapPoints[snapIndex] ?? 0.5;
    const sheetHeight = `${currentSnap * 100}vh`;

    return (
      <div
        className="fixed inset-0 z-50 font-sans"
        role="presentation"
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/70 animate-fade-in"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Sheet */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Bottom sheet'}
          style={{ height: sheetHeight }}
          className={cn(
            'absolute bottom-0 left-0 right-0',
            'rounded-t-2xl',
            'bg-white dark:bg-neutral-900',
            'shadow-modal dark:shadow-modal-dark',
            'animate-slide-up',
            'flex flex-col',
            'transition-[height] duration-slow ease-ease-out',
            className,
          )}
          {...props}
        >
          {/* Drag handle */}
          <div
            className="flex w-full shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="separator"
            aria-label="Drag handle"
          >
            <div className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          </div>

          {/* Title */}
          {title && (
            <div className="shrink-0 px-6 pb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                {title}
              </h2>
            </div>
          )}

          {/* Scrollable content */}
          <div
            ref={sheetRef}
            className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8"
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';
