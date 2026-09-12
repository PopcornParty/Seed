import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pages = process.env.GITHUB_PAGES === "1";

export default defineConfig({
  plugins: [react()],
  base: pages ? "/Seed/" : "/",
  server: { port: 5173, fs: { allow: [".."] }, proxy: { "/api": "http://127.0.0.1:8787" } }
});
