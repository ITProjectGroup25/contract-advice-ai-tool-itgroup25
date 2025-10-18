import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");
const defaultTheme = require("tailwindcss/defaultTheme");

const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(222 47% 11%)", // Deep navy blue
          foreground: "hsl(210 40% 98%)", // Off-white
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96%)", // Light gray-blue
          foreground: "hsl(222 47% 11%)", // Deep navy
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)", // Vibrant red
          foreground: "hsl(0 0% 98%)", // White
        },
        muted: {
          DEFAULT: "hsl(210 40% 96%)", // Light gray
          foreground: "hsl(215 16% 47%)", // Medium gray
        },
        accent: {
          DEFAULT: "hsl(210 40% 96%)", // Light blue-gray
          foreground: "hsl(222 47% 11%)", // Deep navy
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)", // White
          foreground: "hsl(222 47% 11%)", // Deep navy
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)", // White
          foreground: "hsl(222 47% 11%)", // Deep navy
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), nextui(), addVariablesForColors],
} satisfies Config;

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config;
