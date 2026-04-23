/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "Manrope",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      colors: {
        accent: "#00B4D8",
        mid: "#00829B",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
