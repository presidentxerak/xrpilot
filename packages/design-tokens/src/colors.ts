// ---------------------------------------------------------------------------
// Color palette for Pilot – trustworthy, minimal, high-readability
// ---------------------------------------------------------------------------

/** Core brand blue – conveys trust & reliability for a digital wallet. */
export const primary = {
  50:  '#EBF5FF',
  100: '#D6EBFF',
  200: '#ADD6FF',
  300: '#7ABBFF',
  400: '#479FFF',
  500: '#1A84FF',
  600: '#0066E6',
  700: '#004DB3',
  800: '#003380',
  900: '#001A4D',
  950: '#000D26',
} as const;

export const secondary = {
  50:  '#F0F4FF',
  100: '#E0E8FF',
  200: '#C2D1FF',
  300: '#94AEFF',
  400: '#6688FF',
  500: '#3D5AFE',
  600: '#2644DB',
  700: '#1A33B8',
  800: '#112494',
  900: '#0B1870',
  950: '#060D42',
} as const;

export const success = {
  50:  '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
  950: '#022C22',
} as const;

export const warning = {
  50:  '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
} as const;

export const error = {
  50:  '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
} as const;

export const neutral = {
  0:   '#FFFFFF',
  50:  '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0A0A0A',
  1000:'#000000',
} as const;

// ---------------------------------------------------------------------------
// Theme color maps
// ---------------------------------------------------------------------------

export type ThemeColorMap = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  overlay: string;
};

export const lightColors: ThemeColorMap = {
  background:      neutral[0],
  surface:         neutral[0],
  surfaceElevated: neutral[50],
  border:          neutral[200],
  borderSubtle:    neutral[100],
  textPrimary:     neutral[900],
  textSecondary:   neutral[600],
  textTertiary:    neutral[400],
  textInverse:     neutral[0],
  primary:         primary[600],
  primaryHover:    primary[700],
  primaryActive:   primary[800],
  secondary:       secondary[500],
  success:         success[600],
  warning:         warning[500],
  error:           error[600],
  overlay:         'rgba(0, 0, 0, 0.4)',
} as const;

export const darkColors: ThemeColorMap = {
  background:      neutral[1000],
  surface:         neutral[900],
  surfaceElevated: neutral[800],
  border:          neutral[700],
  borderSubtle:    neutral[800],
  textPrimary:     neutral[50],
  textSecondary:   neutral[400],
  textTertiary:    neutral[600],
  textInverse:     neutral[900],
  primary:         primary[400],
  primaryHover:    primary[300],
  primaryActive:   primary[200],
  secondary:       secondary[400],
  success:         success[400],
  warning:         warning[400],
  error:           error[400],
  overlay:         'rgba(0, 0, 0, 0.7)',
} as const;
