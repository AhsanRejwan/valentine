/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'baby-pink': '#FFD4E5',
        peach: '#FFDAB9',
        cream: '#F5E6D3',
        cocoa: '#8B6F47',
        'pastel-blue': '#D4E5FF',
        'soft-rose': '#FFB6C1',
        'rich-brown': '#6B4423',
        'soft-brown': '#D4A574',
        'soft-green': '#D4E5D3',
        'soft-gold': '#FFD4A3',
        sparkle: '#FFF4D4',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3.5xl': '2rem',
      },
      boxShadow: {
        dreamy: '0 18px 45px -25px rgba(107, 68, 35, 0.55)',
        sticker: '0 10px 24px -16px rgba(139, 111, 71, 0.7)',
        glow: '0 0 0 1px rgba(255, 255, 255, 0.5), 0 8px 24px -10px rgba(255, 182, 193, 0.8)',
      },
      keyframes: {
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'sway-soft': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'pulse-glow-soft': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'float-soft': 'float-soft 7s ease-in-out infinite',
        'sway-soft': 'sway-soft 6s ease-in-out infinite',
        'pulse-glow-soft': 'pulse-glow-soft 8s ease-in-out infinite',
      },
      backgroundImage: {
        'dreamy-radial':
          'radial-gradient(circle at 20% 15%, rgba(255, 212, 229, 0.75), transparent 45%), radial-gradient(circle at 80% 20%, rgba(212, 229, 255, 0.7), transparent 42%), radial-gradient(circle at 50% 100%, rgba(245, 230, 211, 0.85), transparent 50%)',
      },
    },
  },
  plugins: [],
}
