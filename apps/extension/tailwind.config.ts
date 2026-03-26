import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './popup.html',
    './src/popup/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pilot: {
          primary: '#6366f1',
          secondary: '#818cf8',
          background: '#0f0f23',
          surface: '#1a1a2e',
          border: '#2a2a4a',
          text: '#e2e8f0',
          muted: '#94a3b8',
          success: '#22c55e',
          warning: '#eab308',
          danger: '#ef4444',
        },
      },
      width: {
        popup: '360px',
      },
      height: {
        popup: '540px',
      },
    },
  },
  plugins: [],
};

export default config;
