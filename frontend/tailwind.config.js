/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FF',
          100: '#E0F0FF',
          200: '#BADAFF',
          500: '#0066FF', // Clinical Electric Blue
          600: '#0052CC',
          700: '#003E99',
          accent: '#00D2FF', // Glowing Cyan
          medical: '#00BFA5' // Clinical Teal
        },
        slate: {
          950: '#0B0F19' // Rich startup-level dark mode base
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(0, 210, 255, 0.35)'
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0h1v20H1V0zm0 1v1h20V1H1z' fill='%239C92AC' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")"
      }
    },
  },
  plugins: [],
}
