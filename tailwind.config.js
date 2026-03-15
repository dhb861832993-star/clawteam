/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          900: '#0D0D0D',
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#333333',
          500: '#444444',
        },
        'accent': {
          orange: '#FFA500',
          green: '#00FF00',
          red: '#FF4444',
          blue: '#3498DB',
        }
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Consolas', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}