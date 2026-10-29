/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#06130B',
          900: '#0C2014',
          800: '#143422',
          700: '#1C4A31',
          600: '#266543',
        },
        agri: {
          leaf: '#2E7D4F',
          lime: '#65A30D',
          emerald: '#059669',
          amber: '#D97706',
          sand: '#EFE8DA',
          cream: '#F9F6F0',
          stone: '#57625B',
          paper: '#FFFFFF',
          border: '#E2DBD0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(12, 32, 20, 0.05)',
        'card': '0 10px 30px -5px rgba(12, 32, 20, 0.07)',
        'lifted': '0 18px 40px -8px rgba(12, 32, 20, 0.12)',
      }
    },
  },
  plugins: [],
}
