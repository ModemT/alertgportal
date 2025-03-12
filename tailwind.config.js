/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae3ff',
          200: '#7cc4fa',
          300: '#47a3f3',
          400: '#2186eb',
          500: '#0967d2',
          600: '#0552b5',
          700: '#03449e',
          800: '#01337d',
          900: '#002159',
        },
        secondary: {
          50: '#e3f9e5',
          100: '#c1eac5',
          200: '#a3d9a5',
          300: '#7bc47f',
          400: '#57ae5b',
          500: '#3f9142',
          600: '#2f8132',
          700: '#207227',
          800: '#0e5814',
          900: '#05400a',
        }
      }
    },
  },
  plugins: [],
} 