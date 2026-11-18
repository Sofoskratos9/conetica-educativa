import type { Config } from "tailwindcss";

/**
 * Conética Educativa — sistema visual NEFTALÍ.
 * Paleta dibujada a mano: fondo crema, verde oscuro, terracota.
 * Antes: azul marino/cobalto + esmeralda ("Editorial Academic").
 * Los tokens `brand` y `accent` se redefinen aquí para que los ~50
 * archivos que ya los usan cambien de paleta sin tocar su lógica.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        // Verde oscuro NEFTALÍ (antes azul marino/cobalto #2563eb…).
        // Valores exactos de SISTEMA-VISUAL.md §1 y §7.
        brand: {
          50: "#F5F1EA",
          100: "#E9E2D3",
          200: "#D8CDB2",
          300: "#B7A67E",
          400: "#2E6B45",
          500: "#14532D",
          600: "#14532D",
          700: "#0E3B20",
          800: "#0B2E19",
          900: "#082412",
        },
        // Terracota NEFTALÍ (antes esmeralda #10b981…). Solo acento:
        // nunca fondo principal, nunca botón.
        accent: {
          50: "#FBF0E9",
          100: "#F6DDCC",
          200: "#EDBC9C",
          300: "#DE8F5F",
          400: "#C96F4A",
          500: "#C96F4A",
          600: "#A8542F",
          700: "#83391B",
        },
        // Crema NEFTALÍ.
        cream: {
          DEFAULT: "#F5F1EA",
          paper: "#FBF8F1",
          deep: "#EFE7D8",
        },
        // Apoyos (solo manchas/detalles, nunca texto ni botones).
        ochre: "#D9A441",
        sage: "#8AA899",
        slateblue: "#6B8CAE",
        ink: "#2B2B26",
      },
    },
  },
  plugins: [],
};

export default config;
