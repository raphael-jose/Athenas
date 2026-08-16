import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" → assets relativos: funcionam em qualquer subpath do GitHub Pages
// (https://user.github.io/repo/) sem precisar conhecer o nome do repo.
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "icons/icon-192.png", "icons/icon-512.png", "favicon.svg"],
      manifest: {
        id: "./",
        name: "Athenas — Aprenda francês jogando",
        short_name: "Athenas",
        description: "O RPG mais fofo para aprender francês ",
        lang: "pt-BR",
        theme_color: "#f7c9dd",
        background_color: "#fff7fa",
        display: "standalone",
        display_override: ["standalone", "fullscreen", "minimal-ui", "browser"],
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"]
      },
      devOptions: { enabled: false }
    })
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
