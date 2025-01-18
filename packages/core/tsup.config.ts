import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  shims: true,
  clean: true,
  dts: true,
});
