import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

const shouldAnalyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    vue(),
    shouldAnalyze &&
      visualizer({
        filename: "dist/bundle-report.html",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
  base: "/",
  build: {
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) {
              return "vendor-three";
            }
            if (id.includes("gsap")) {
              return "vendor-gsap";
            }
            if (id.includes("lenis")) {
              return "vendor-lenis";
            }
            if (id.includes("vue") || id.includes("vue-router")) {
              return "vendor-vue";
            }
          }
        },
      },
    },
  },
});
