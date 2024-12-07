import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import reactImage from "vite-img/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reactImage()],
});
