/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: '#ff7a00',
        dark: '#111111',
        lightGray: '#f3f4f6',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}
