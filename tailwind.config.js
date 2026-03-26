/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        term: {
          bg: '#0a0e14',
          surface: '#0d1117',
          border: '#1e2937',
          green: '#00ff88',
          red: '#ff4444',
          amber: '#ffaa00',
          dim: '#4a5568',
          text: '#c9d1d9',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        blink: 'blink 1.2s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
