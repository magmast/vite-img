import { defineConfig } from 'tsup';
import fs from 'fs/promises';

export default defineConfig({
  entry: ['src/index.tsx', 'src/plugin.ts', 'src/react-router.ts'],
  sourcemap: true,
  dts: true,
  format: 'esm',
  external: ['virtual:vite-img/sizes'],
  async onSuccess() {
    const types = await fs.readFile('src/types.d.ts', 'utf-8');
    const withUpdatedImport = types.replaceAll(".", "vite-img");
    await fs.writeFile('dist/types.d.ts', withUpdatedImport);
  }
});