import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07111f",
        card: "#101c2c",
        accent: "#6ee7f9",
        accentSecondary: "#b6ff8a",
        ink: "#e5f2ff",
        muted: "#87a4c1",
        danger: "#ff7a90",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(110, 231, 249, 0.12), 0 24px 80px rgba(10, 20, 35, 0.45)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(110, 231, 249, 0.22), transparent 35%), linear-gradient(180deg, #07111f 0%, #091524 45%, #040a12 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
