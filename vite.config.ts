import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    // Keep webfonts inside the generated CSS so static hosts do not need
    // to accept separate .woff2 files. The 210 KB headshot remains a PNG.
    assetsInlineLimit: 32 * 1024,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
