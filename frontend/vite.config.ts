import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: mode === "hosted" ? false : "public",
  server: { proxy: { "/api": "http://localhost:5000", "/outputs": "http://localhost:5000" } },
}));
