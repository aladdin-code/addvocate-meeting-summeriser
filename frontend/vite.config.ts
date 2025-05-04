import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is required for Docker
    host: "0.0.0.0",
    port: 5173,
    // Enable file watching in Docker
    watch: {
      usePolling: true,
    },
    // Proxy API requests to backend
    proxy: {
      "/api": {
        target: "http://localhost:3000/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
