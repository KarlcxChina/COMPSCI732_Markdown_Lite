/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f1ea',
        ink: '#1f2937',
        panel: '#fffdf8',
        stroke: '#d9d1c4',
        accent: '#b45309',
        accentSoft: '#fef3c7'
      },
      boxShadow: {
        paper: '0 20px 50px -30px rgba(15, 23, 42, 0.25)'
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI Variable"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"Cascadia Code"', '"SF Mono"', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
