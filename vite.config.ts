import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
        // A voz pt-BR (Piper/Dii) é baixada SOB DEMANDA (quando o app fala
        // português) — nunca entra no precache do PWA (senão a instalação
        // inicial baixaria ~110 MB de runtime de voz).
        globIgnores: ["worker/**", "onnx/**", "piper/**", "assets/piperVoice.worker-*.js"]
      },
      devOptions: { enabled: false }
    }),
    // Runtime da voz pt-BR (Piper): copiado para a raiz do site e carregado
    // só quando o app fala português. CPU (OnnxWebWorker) + espeak-ng
    // (piper_phonemize) — sem WebGPU para não inflar o deploy.
    // Só o que o fluxo CPU realmente usa: o OnnxWebRuntime carrega apenas
    // ort-wasm-simd-threaded.wasm (o jsep.wasm é do caminho WebGPU/WebNN e o
    // OnnxWebGPUWorker.js de 45MB nunca é criado). Cortar esses dois reduz o
    // download do celular em ~66MB na primeira vez que a Lulu fala português.
    viteStaticCopy({
      targets: [
        { src: "node_modules/piper-tts-web/dist/onnx/ort-wasm-simd-threaded.wasm", dest: "onnx", rename: { stripBase: true } },
        { src: "node_modules/piper-tts-web/dist/piper/*", dest: "piper", rename: { stripBase: true } },
        { src: "node_modules/piper-tts-web/dist/worker/OnnxWebWorker.js", dest: "worker", rename: { stripBase: true } },
        { src: "node_modules/piper-tts-web/dist/worker/PhonemizeWebWorker.js", dest: "worker", rename: { stripBase: true } },
        { src: "node_modules/piper-tts-web/dist/worker/ExpressionWebWorker.js", dest: "worker", rename: { stripBase: true } }
      ]
    })
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
