/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // Deep slate/charcoal
        panel: "rgba(15, 23, 42, 0.7)",
        accent: {
          green: "#4ade80",
          red: "#f87171",
          blue: "#60a5fa",
          cyan: "#22d3ee",   // Neon cyan
          purple: "#a855f7"  // Electric purple
        }
      },
      backdropBlur: {
        xs: "2px",
        xl: "24px",
      },
      keyframes: {
        'radar-pulse': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 211, 238, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 20px rgba(34, 211, 238, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 211, 238, 0)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        }
      },
      animation: {
        'radar': 'radar-pulse 2s infinite',
        'glitch': 'glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite'
      }
    },
  },
  plugins: [],
}
