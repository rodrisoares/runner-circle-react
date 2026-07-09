/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Work Sans', 'sans-serif'],
      },
      colors: {
        'brand': {
          'white': '#FFFFFF',
          'offwhite': '#D9D9D9',
          'green-light': '#FCFFE4',
          'green-medium': '#DBFFB1',
          'green-lime': '#B6FF02',
          // Passos escuros da mesma rampa do green-lime (matiz OKLCH 127.7 mantido).
          // O lime rende 1.18:1 contra branco; estes dois passam. Ver src/utils/chartTheme.js.
          'green-dark': '#669009',  // 3.78:1 — marcas de grafico, preenchimento do meter
          'green-deep': '#436007',  // 7.20:1 — texto e valores em destaque
          'blue': '#699CFF',
          'gray-light': '#7E7E7E',
          'gray-medium': '#494949',
          'graphite': '#1D1D1D',
        }
      }
    },
  },
  plugins: [],
}

