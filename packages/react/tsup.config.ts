import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  sourcemap: true,
  shims: true,
  clean: true,
  dts: true,
  external: ["virtual:vite-img/sizes"],
});
