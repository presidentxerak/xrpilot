// ---------------------------------------------------------------------------
// Animation / transition tokens
// ---------------------------------------------------------------------------

/** Transition durations in milliseconds. */
export const duration = {
  instant: 0,
  fast:    100,
  normal:  200,
  slow:    300,
  slower:  500,
} as const;

/** CSS easing curves. */
export const easing = {
  /** Default – slight deceleration, natural feel. */
  default:    'cubic-bezier(0.25, 0.1, 0.25, 1)',
  /** Elements entering the screen. */
  easeOut:    'cubic-bezier(0, 0, 0.2, 1)',
  /** Elements leaving the screen. */
  easeIn:     'cubic-bezier(0.4, 0, 1, 1)',
  /** Elements that move (e.g. slide between positions). */
  easeInOut:  'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Playful overshoot for micro-interactions. */
  spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** No easing. */
  linear:     'linear',
} as const;

/** Pre-composed CSS transition shorthand helpers. */
export const transition = {
  fast:    `all ${duration.fast}ms ${easing.default}`,
  normal:  `all ${duration.normal}ms ${easing.default}`,
  slow:    `all ${duration.slow}ms ${easing.default}`,
  colors:  `color ${duration.normal}ms ${easing.default}, background-color ${duration.normal}ms ${easing.default}, border-color ${duration.normal}ms ${easing.default}`,
  opacity: `opacity ${duration.normal}ms ${easing.default}`,
  transform: `transform ${duration.normal}ms ${easing.easeOut}`,
} as const;

export type Duration = keyof typeof duration;
export type Easing   = keyof typeof easing;
