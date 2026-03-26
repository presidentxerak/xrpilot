import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// ObjectCard -- display card for digital objects (NFTs, tokens, etc.)
// ---------------------------------------------------------------------------

export interface ObjectCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Image URL for the digital object. */
  imageSrc?: string;
  /** Alt text for the image. */
  imageAlt?: string;
  /** Name of the digital object. */
  name: string;
  /** Category label (e.g. "Collectible", "Ticket", "Pass"). */
  category?: string;
  /** Issuer name or address. */
  issuer?: string;
  /** Short utility / description text. */
  utilityDescription?: string;
  /** Called when the card is tapped. */
  onPress?: () => void;
}

export const ObjectCard = forwardRef<HTMLDivElement, ObjectCardProps>(
  (
    {
      className,
      imageSrc,
      imageAlt,
      name,
      category,
      issuer,
      utilityDescription,
      onPress,
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
          'group flex flex-col overflow-hidden rounded-xl font-sans',
          'bg-white dark:bg-neutral-900',
          'shadow-card dark:shadow-card-dark',
          'transition-all duration-normal',
          interactive && [
            'cursor-pointer',
            'hover:shadow-elevated dark:hover:shadow-elevated-dark',
            'active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
          ],
          className,
        )}
        {...props}
      >
        {/* Image area with 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt ?? name}
              className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="text-neutral-300 dark:text-neutral-600"
                aria-hidden="true"
              >
                <rect
                  x="8"
                  y="8"
                  width="32"
                  height="32"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="18" cy="18" r="3" fill="currentColor" />
                <path
                  d="M8 32l8-8 6 6 4-4 14 14H12a4 4 0 01-4-4V32z"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg>
            </div>
          )}

          {/* Category badge */}
          {category && (
            <span
              className={cn(
                'absolute left-3 top-3',
                'rounded-full px-2.5 py-1 text-xs font-medium',
                'bg-white/90 text-neutral-700 backdrop-blur-sm',
                'dark:bg-neutral-900/90 dark:text-neutral-300',
              )}
            >
              {category}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="truncate text-base font-bold text-neutral-900 dark:text-neutral-50">
            {name}
          </h3>

          {issuer && (
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
              by {issuer}
            </p>
          )}

          {utilityDescription && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {utilityDescription}
            </p>
          )}
        </div>
      </div>
    );
  },
);

ObjectCard.displayName = 'ObjectCard';
