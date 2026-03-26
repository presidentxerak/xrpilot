// ---------------------------------------------------------------------------
// Typography – Roboto only, optimised for readability
// ---------------------------------------------------------------------------

export const fontFamily = {
  sans:  "'Roboto', 'Helvetica Neue', Arial, sans-serif",
  mono:  "'Roboto Mono', ui-monospace, monospace",
} as const;

/** rem-based font sizes (1 rem = 16 px) */
export const fontSize = {
  xs:   '0.75rem',   // 12px
  sm:   '0.875rem',  // 14px
  base: '1rem',      // 16px
  lg:   '1.125rem',  // 18px
  xl:   '1.25rem',   // 20px
  '2xl':'1.5rem',    // 24px
  '3xl':'1.875rem',  // 30px
  '4xl':'2.25rem',   // 36px
} as const;

export const fontWeight = {
  light:    300,
  regular:  400,
  medium:   500,
  bold:     700,
} as const;

/** Generous line heights for high readability. */
export const lineHeight = {
  tight:  1.25,
  snug:   1.375,
  normal: 1.5,
  relaxed:1.625,
  loose:  2,
} as const;

export const letterSpacing = {
  tight:  '-0.025em',
  normal: '0em',
  wide:   '0.025em',
  wider:  '0.05em',
} as const;

export type FontSize   = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
