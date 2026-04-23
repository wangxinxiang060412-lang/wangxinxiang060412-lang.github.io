import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: "/",
  build: {
    assetsInlineLimit: 100000,
    chunkSizeWarningLimit: 1500, // 提高警告阈值，因为 3D 库本身就大
    rollupOptions: {
      output: {
        // 手动代码分割：把沉重的第三方库单独打包，利用浏览器缓存
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) {
              return "vendor-three"; // 独立打包 Three.js
            }
            if (id.includes("gsap")) {
              return "vendor-gsap"; // 独立打包 GSAP
            }
            if (id.includes("vue") || id.includes("vue-router")) {
              return "vendor-vue"; // 独立打包 Vue 全家桶
            }
            return "vendor-base"; // 其他依赖
          }
        },
      },
    },
  },
});
