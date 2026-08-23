/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080e',
          900: '#0b0f19',
          850: '#101524',
          800: '#161d31',
          700: '#1f2942',
          600: '#2d3b5c',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        agent: {
          planner: '#38bdf8', // Sky
          execution: '#a855f7', // Purple
          validation: '#34d399', // Emerald
          recovery: '#f59e0b', // Amber
          monitoring: '#ec4899', // Pink
          orchestrator: '#6366f1', // Indigo
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.2))' },
        },
      },
    },
  },
  plugins: [],
};
