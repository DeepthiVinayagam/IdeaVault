/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0B1020',
          card: '#151C30',
          cardHover: '#1A233D',
          border: '#232E4D',
          borderLight: '#35436E',
          violet: '#8B5CF6',
          violetDark: '#6D28D9',
          violetLight: '#A78BFA',
          cyan: '#42D6E8',
          cyanDark: '#0891B2',
          cyanLight: '#67E8F9',
          text: '#E8ECF5',
          textMuted: '#94A3B8',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(66, 214, 232, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
