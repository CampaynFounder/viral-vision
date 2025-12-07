import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        champagne: {
          DEFAULT: "#D4AF37",
          light: "#F3E5AB",
          dark: "#B8941F",
        },
        mocha: {
          DEFAULT: "#8B7355",
          light: "#A68B6B",
          dark: "#6B5A42",
        },
        alabaster: {
          DEFAULT: "#FAF9F6",
          light: "#FFFFFF",
          dark: "#F5F3F0",
        },
        rosegold: {
          DEFAULT: "#E8B4B8",
          light: "#F5D7DA",
          dark: "#D99BA0",
        },
      },
      fontFamily: {
        serif: ["Canela", "Cinzel", "serif"],
        sans: ["Montserrat", "Geist", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

