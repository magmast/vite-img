import fs from 'fs/promises';
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  shims: true,
  dts: true,
  async onSuccess() {
    await fs.copyFile('./src/types.d.ts', './dist/types.d.ts');
  }
});
