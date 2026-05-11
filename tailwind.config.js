/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          950: '#07040a',
          900: '#0f0a0e',
          800: '#1a0f14',
          700: '#1f1318',
          600: '#2a1a20',
          500: '#3d2030',
          400: '#7b2d3e',
          300: '#9d3a4f',
          200: '#c47b8f',
          100: '#e8c5ce',
          50:  '#f8eef1',
        },
        gold: {
          900: '#2a1f0a',
          800: '#4a3510',
          700: '#7a5a1e',
          600: '#a07530',
          500: '#c9a96e',
          400: '#d9bf8e',
          300: '#e8d5ae',
          200: '#f2e8d0',
          100: '#faf5ec',
        },
        cream: {
          DEFAULT: '#f0e6d3',
          muted:   '#c4b5a3',
          dark:    '#8b7a6b',
          darker:  '#5c4a3d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      backgroundImage: {
        'wine-gradient': 'linear-gradient(135deg, #0f0a0e 0%, #1a0f14 50%, #1f1318 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c9a96e 0%, #e8d5ae 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26,15,20,0.9) 0%, rgba(31,19,24,0.7) 100%)',
      },
      boxShadow: {
        'wine':    '0 4px 32px rgba(123, 45, 62, 0.25)',
        'gold':    '0 4px 32px rgba(201, 169, 110, 0.20)',
        'card':    '0 8px 32px rgba(0,0,0,0.4)',
        'glow-wine': '0 0 20px rgba(123, 45, 62, 0.4)',
        'glow-gold': '0 0 20px rgba(201, 169, 110, 0.3)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
