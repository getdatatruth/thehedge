import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        lora: ["var(--font-lora)", "serif"],
        body: ["var(--font-dm)", "sans-serif"],
      },
      colors: {
        cream: "#F9F5EE",
        "green-deep": "#2C4A2E",
        "green-mid": "#4A7C4E",
        "green-light": "#7BAE7F",
        "green-mist": "#C8DFC9",
        earth: "#8B6B4A",
        bark: "#3D2B1F",
        gold: "#C8962A",
      },
    },
  },
  plugins: [],
} satisfies Config;
