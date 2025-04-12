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
        primary: {
          DEFAULT: "#3b82f6", // blue-500
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
    },
  },
  plugins: [
    require("daisyui"),
  ],
};

// Extra configuration for daisyUI
const daisyuiConfig = {
  themes: [
    {
      formulai: {
        "primary": "#3b82f6",
        "secondary": "#818cf8",
        "accent": "#f59e0b",
        "neutral": "#2a2e37",
        "base-100": "#ffffff",
        "info": "#0ea5e9",
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
      },
    },
  ],
  darkTheme: "dark",
  base: true,
  styled: true,
  utils: true,
  logs: false,
};

// @ts-ignore - DaisyUI augments the Tailwind config
config.daisyui = daisyuiConfig;

export default config; 