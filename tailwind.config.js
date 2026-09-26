/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        master: {
          darkest: '#05070c',
          bg: '#090b12',
          card: '#0f131f',
          panel: '#151929',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(99, 102, 241, 0.35)',
        },
        ai: {
          cyan: '#00f2fe',
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
          rose: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'orb-float': 'orbFloat 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'scanline': 'scanline 4s linear infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.06)' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.02)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        waveform: {
          '0%': { height: '8px' },
          '100%': { height: '36px' },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 25px -5px rgba(59, 130, 246, 0.4)',
        'neon-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'neon-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.35)',
        'neon-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
