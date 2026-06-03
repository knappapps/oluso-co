/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: { 50:'#F0FDFA',100:'#CCFBF1',200:'#99F6E4',400:'#2DD4BF',500:'#14B8A6',600:'#0D9488',700:'#0F766E',800:'#115E59',900:'#134E4A' },
        navy: { 600:'#1E3A5F',700:'#162D4A',800:'#0F1E35' },
        amber: { 400:'#FBBF24',500:'#F59E0B',600:'#D97706' },
      }
    }
  },
  plugins: []
}