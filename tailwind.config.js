/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0B0E14",
          card: "#151A24",
          accent: "#FF4D4D",
          accentHover: "#E63939",
        },
      },
    },
  },
  plugins: [],
};