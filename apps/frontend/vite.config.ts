import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    allowedHosts: [
      "d624-5-104-75-74.ngrok-free.app",
      "d70a-5-104-75-74.ngrok-free.app",
    ],
  },
});
