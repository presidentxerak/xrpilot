// ---------------------------------------------------------------------------
// Spacing scale – large values for comfortable tap targets & readability
// ---------------------------------------------------------------------------

/**
 * Spacing scale keyed by logical size.
 * Values are in pixels (as numbers) so consumers can convert to rem/px as
 * needed. The scale deliberately includes large increments for generous
 * whitespace that is central to Pilot's minimalist aesthetic.
 */
export const spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Minimum interactive element sizes (px).
 * WCAG 2.5.8 recommends at least 44 x 44 CSS pixels for touch targets.
 */
export const tapTarget = {
  /** Absolute minimum for any tappable element. */
  min:     44,
  /** Default comfortable tap target. */
  default: 48,
  /** Large buttons / primary CTAs. */
  large:   56,
} as const;

export const borderRadius = {
  none: 0,
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
} as const;

export type SpacingKey     = keyof typeof spacing;
export type TapTargetKey   = keyof typeof tapTarget;
export type BorderRadiusKey = keyof typeof borderRadius;
