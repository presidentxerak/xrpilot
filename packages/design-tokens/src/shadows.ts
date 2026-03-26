// ---------------------------------------------------------------------------
// Shadow tokens – subtle elevation hierarchy for a minimalist UI
// ---------------------------------------------------------------------------

export const shadows = {
  /** No shadow. */
  none: 'none',

  /** Subtle lift for cards at rest. */
  sm:   '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  /** Default card shadow. */
  md:   '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',

  /** Dropdown menus, popovers. */
  lg:   '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',

  /** Modals, dialogs. */
  xl:   '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',

  /** Top-level overlays. */
  '2xl':'0 25px 50px -12px rgba(0, 0, 0, 0.15)',
} as const;

/** Dark-mode shadows use slightly lighter opacities on a black background. */
export const shadowsDark = {
  none: 'none',
  sm:   '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md:   '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg:   '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl:   '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  '2xl':'0 25px 50px -12px rgba(0, 0, 0, 0.7)',
} as const;

export type Shadow = keyof typeof shadows;
