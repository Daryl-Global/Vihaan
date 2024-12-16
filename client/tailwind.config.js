/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'vihaan-honda-red': '#fa1321',
        'vihaan-honda-red-darker': '#c60f1a',
      },
    },
  },
  plugins: [],
};
