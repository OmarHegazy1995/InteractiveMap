import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/InteractiveMapArar/",
  build: {
    chunkSizeWarningLimit: 1000, // يرفع الحد للتحذير (مثلاً 1000 كيلوبايت)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) {
              return "vendor_react";
            }
            return "vendor";
          }
        },
      },
    },
  },
});

