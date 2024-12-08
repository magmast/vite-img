import swc from "@rollup/plugin-swc";
import { defineConfig, type RollupOptions } from "rollup";

export default defineConfig([
  bundle({ input: "index.tsx", output: "index" }),
  bundle({ input: "plugin.ts", output: "plugin" }),
  bundle({ input: 'react-router.ts', output: 'react-router' })
]);

function bundle({ input, output }: { input: string; output: string }) {
  return {
    input: `src/${input}`,
    output: [
      {
        file: `dist/${output}.js`,
        format: "es",
      },
      {
        file: `dist/${output}.cjs`,
        format: "cjs",
      },
    ],
    plugins: [
      swc({
        swc: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
              },
            },
          },
        },
      }),
    ],
  } satisfies RollupOptions;
}
