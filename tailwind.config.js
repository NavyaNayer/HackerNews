/**  @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6600',
          dark: '#ff8833',
          light: '#ffaa66'
        },
        dark: {
          100: '#1a1a1a',
          200: '#2a2a2a',
          300: '#3a3a3a',
          400: '#4a4a4a',
          500: '#5a5a5a'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace']
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-primary',
    'hover:bg-primary',
    'focus:ring-primary',
    'text-primary',
    'border-primary',
    'dark:text-primary-dark',
    'dark:bg-primary-dark',
    'dark:border-primary-dark',
    'dark:focus:ring-primary-dark',
  ]
};
 