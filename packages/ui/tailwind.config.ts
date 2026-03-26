import type { Config } from 'tailwindcss';
import {
  primary,
  secondary,
  success,
  warning,
  error,
  neutral,
} from '@pilot/design-tokens';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Roboto'", "'Helvetica Neue'", 'Arial', 'sans-serif'],
        mono: ["'Roboto Mono'", 'ui-monospace', 'monospace'],
      },
      colors: {
        primary,
        secondary,
        success,
        warning,
        error,
        neutral,
      },
      spacing: {
        '11': '2.75rem',   // 44px – minimum tap target
        '13': '3.25rem',   // 52px
        '14': '3.5rem',    // 56px – large tap target
        '15': '3.75rem',   // 60px
        '18': '4.5rem',    // 72px
        '22': '5.5rem',    // 88px
      },
      minHeight: {
        'tap': '2.75rem',      // 44px
        'tap-lg': '3.5rem',    // 56px
      },
      minWidth: {
        'tap': '2.75rem',      // 44px
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'elevated-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'modal-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'spinner': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'toast-enter': {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-enter-bottom': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-exit': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(-100%)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        'fade-out': 'fade-out 200ms cubic-bezier(0.4, 0, 1, 1)',
        'slide-up': 'slide-up 300ms cubic-bezier(0, 0, 0.2, 1)',
        'slide-down': 'slide-down 300ms cubic-bezier(0.4, 0, 1, 1)',
        'shake': 'shake 400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'skeleton-pulse': 'skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spinner': 'spinner 700ms linear infinite',
        'toast-enter': 'toast-enter 300ms cubic-bezier(0, 0, 0.2, 1)',
        'toast-enter-bottom': 'toast-enter-bottom 300ms cubic-bezier(0, 0, 0.2, 1)',
        'toast-exit': 'toast-exit 200ms cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
