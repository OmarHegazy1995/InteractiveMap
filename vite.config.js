import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    port: 5175,
  },
<<<<<<< HEAD
  base: "/InteractiveMap/", 
=======
  base: "/InteractiveMap/", 
>>>>>>> f8a1c2c (Save local changes before pull)
});



