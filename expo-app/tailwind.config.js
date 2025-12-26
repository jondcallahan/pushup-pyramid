/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['System'],
        display: ['System'],
        mono: ['Courier'],
      },
      colors: {
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        cyan: {
          400: '#22d3ee',
        },
        sky: {
          400: '#38bdf8',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        fuchsia: {
          400: '#e879f9',
        },
        purple: {
          600: '#9333ea',
        },
        indigo: {
          600: '#4f46e5',
        },
      }
    },
  },
  plugins: [],
}
