/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: "#0a0a0a",
          gold: "#c5a880",
          cream: "#fdfcf7",
          gray: "#737373"
        }
      },
      fontFamily: {
        serif: ['Times New Roman', 'serif'],
      }
    },
  },
  plugins: [],
}