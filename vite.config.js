import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],

  build: {
    lib: {
      entry: "src/main.js", // 👈 your package entry point
      name: "InvestmentCalculator",     // 👈 UMD global name
      fileName: (format) => `investment-calculator.${format}.js`,
    },
    rollupOptions: {
      
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
