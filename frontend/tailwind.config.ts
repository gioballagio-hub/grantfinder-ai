import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F9A602",
          muted: "rgba(212, 175, 55, 0.1)",
          20: "rgba(212, 175, 55, 0.2)",
        },
        dark: {
          DEFAULT: "#000000",
          card: "#0c0c0c",
          lighter: "#141414",
          border: "#1f1f1f",
          muted: "#707070",
        },
        light: "#ededed",
      },
    },
  },
  plugins: [],
};
export default config;
