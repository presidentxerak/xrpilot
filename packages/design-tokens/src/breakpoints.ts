// ---------------------------------------------------------------------------
// Mobile-first breakpoints (min-width, in pixels)
// ---------------------------------------------------------------------------

export const breakpoints = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
} as const;

/** CSS media-query strings for convenience. */
export const mediaQueries = {
  sm:  `(min-width: ${breakpoints.sm}px)`,
  md:  `(min-width: ${breakpoints.md}px)`,
  lg:  `(min-width: ${breakpoints.lg}px)`,
  xl:  `(min-width: ${breakpoints.xl}px)`,
} as const;

export type Breakpoint = keyof typeof breakpoints;
