import { forwardRef, useState, type ImgHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ---------------------------------------------------------------------------
// Avatar variants
// ---------------------------------------------------------------------------

const avatarVariants = cva(
  [
    'relative inline-flex items-center justify-center',
    'shrink-0 overflow-hidden rounded-full',
    'bg-primary-100 text-primary-700',
    'dark:bg-primary-900 dark:text-primary-300',
    'font-sans font-medium select-none',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-11 w-11 text-sm',
        lg: 'h-14 w-14 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

// ---------------------------------------------------------------------------
// Avatar component
// ---------------------------------------------------------------------------

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'>,
    VariantProps<typeof avatarVariants> {
  /** Name used to derive initials when no image is available. */
  name?: string;
  /** Image URL for the avatar. */
  src?: string;
  /** Show a verification badge overlay. */
  verified?: boolean;
}

/** Derive up to 2 initials from a full name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, name, src, alt, verified, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;
    const initials = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        role="img"
        aria-label={alt ?? name ?? 'Avatar'}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
            {...props}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}

        {/* Verification badge */}
        {verified && (
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 flex items-center justify-center',
              'rounded-full border-2 border-white dark:border-neutral-900',
              'bg-success-500 text-white',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'md' && 'h-4.5 w-4.5',
              size === 'lg' && 'h-5 w-5',
            )}
            aria-label="Verified"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="h-2.5 w-2.5"
              aria-hidden="true"
            >
              <path
                d="M10 3.5L4.75 8.5L2 5.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';

export { avatarVariants };
