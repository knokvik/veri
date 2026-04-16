/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        climateGreen: '#2e7d32',
        tealAccent: '#00bfa5',
        darkBg: '#0f172a',
        cardBg: '#1e293b',
      },
    },
  },
  plugins: [],
}
