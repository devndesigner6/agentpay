module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Mono', 'Geist', 'ui-monospace', 'monospace'],
        instrument: ['"Instrument Serif"', 'serif'],
        departure: ['"Departure Mono"', 'monospace'],
        jetbrains: ['"JetBrains Mono"', 'monospace'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      colors: {
        brand: {
          green: '#a3e635',
          black: '#000000',
          navy: '#09090b',
          gray: '#18181b',
          border: '#27272a',
        },
        gray: {
          850: '#1E1E24',
          950: '#0D0D0F',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
