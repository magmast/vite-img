import { default as sharp } from "sharp";
import { type Plugin, type ResolvedConfig } from "vite";
import path from 'path';
import fs from "fs/promises";

const sizesModule = "virtual:vite-img/sizes";

const resolvedSizesModule = `\0${sizesModule}`;

const imageIdRegexp = /\.(png|jpe?g|webp|avif|tiff|gif|svg)$/;

export interface ViteImgParams {
  sizes?: number[];
}

export default function viteImg({
  sizes = [320, 640, 768, 1024, 1280, 1536, 2560],
}: ViteImgParams = {}): Plugin {
  let config: ResolvedConfig;
  const imageCache = new Map<string, Buffer>();

  return {
    name: "vite-img",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    resolveId(id) {
      if (id === sizesModule) {
        return resolvedSizesModule;
      }
    },

    load: {
      order: "pre",
      async handler(id) {
        if (id === resolvedSizesModule) {
          return `
            export default [${sizes.map((size) => size.toString()).join(", ")}];
          `;
        }

        if (imageIdRegexp.test(id)) {
          const data = await fs.readFile(id);
          imageCache.set(id, data);

          const image = sharp(data);
          const metadata = await image.metadata();
          const blurBuffer = await image
            .clone()
            .png()
            .resize({ width: 10 })
            .toBuffer();

          const relativePath = path.relative(config.root, id);
          const src = config.command === "build" ? `${config.build.assetsDir}/${path.basename(id)}` : relativePath;

          return `
            export default {
              src: "${src}",
              width: ${metadata.width},
              height: ${metadata.height},
              blurUrl: "data:image/png;base64,${blurBuffer.toString("base64")}",
            }
          `;
        }
      },
    },

    generateBundle() {
      if (!config.build.ssr) {
        return;
      }

      for (const [id, data] of imageCache) {
        const fileName = path.basename(id);
        this.emitFile({
          type: 'asset',
          fileName: `${config.build.assetsDir}/${fileName}`,
          source: data,
        });
      }
    }
  };
}
