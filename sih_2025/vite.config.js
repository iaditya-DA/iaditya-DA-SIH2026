import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Enables React support (HMR, JSX, etc.)
    react(),
  ],
  resolve: {
    // Allows you to use nice import paths like '@/components' instead of '../../components'
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // This section is for LOCAL DEVELOPMENT ONLY to mimic Vercel's behavior
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to your local backend server
      '/api': {
        target: 'http://localhost:8000', // The address of your local Node.js API
        changeOrigin: true,
      },
    }
  }
});