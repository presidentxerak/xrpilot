// ---------------------------------------------------------------------------
// Composed theme objects – light & dark
// ---------------------------------------------------------------------------

import { lightColors, darkColors, type ThemeColorMap } from './colors.js';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from './typography.js';
import { spacing, tapTarget, borderRadius } from './spacing.js';
import { breakpoints, mediaQueries } from './breakpoints.js';
import { shadows, shadowsDark } from './shadows.js';
import { duration, easing, transition } from './animations.js';

export type Theme = {
  colors: ThemeColorMap;
  fontFamily:     typeof fontFamily;
  fontSize:       typeof fontSize;
  fontWeight:     typeof fontWeight;
  lineHeight:     typeof lineHeight;
  letterSpacing:  typeof letterSpacing;
  spacing:        typeof spacing;
  tapTarget:      typeof tapTarget;
  borderRadius:   typeof borderRadius;
  breakpoints:    typeof breakpoints;
  mediaQueries:   typeof mediaQueries;
  shadows:        typeof shadows | typeof shadowsDark;
  duration:       typeof duration;
  easing:         typeof easing;
  transition:     typeof transition;
};

const shared = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  tapTarget,
  borderRadius,
  breakpoints,
  mediaQueries,
  duration,
  easing,
  transition,
} as const;

export const lightTheme: Theme = {
  colors: lightColors,
  shadows,
  ...shared,
};

export const darkTheme: Theme = {
  colors: darkColors,
  shadows: shadowsDark,
  ...shared,
};

export type ThemeMode = 'light' | 'dark';

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark:  darkTheme,
};
