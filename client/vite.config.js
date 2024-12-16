import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: path.resolve(__dirname, "server.key"), // Path to your server's private key
      cert: path.resolve(__dirname, "server.crt"), // Path to your server's signed certificate
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Use HTTPS in the target URL
        secure: false, // Set to true to enable secure proxying (HTTPS)
       // changeOrigin: true, // Change the origin of the request to match the target's origin
      },
    },
  },
  plugins: [react()],
});
