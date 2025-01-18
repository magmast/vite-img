import { defineConfig } from "@solidjs/start/config";
import viteImg from "@vite-img/plugin";

export default defineConfig({
  vite: {
    plugins: [viteImg()],
  },
});
