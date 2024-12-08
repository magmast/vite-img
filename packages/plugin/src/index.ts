import { default as sharp } from "sharp";
import type { Plugin, ResolvedConfig } from "vite";
import path from 'path';
import fs from "fs/promises";
import crypto from 'crypto';

const sizesModule = "virtual:vite-img/sizes";

const resolvedSizesModule = `\0${sizesModule}`;

const imageIdRegexp = /\.(png|jpe?g|webp|avif|tiff|gif|svg)$/;

interface CachedImage {
  src: string;
  width?: number;
  height?: number;
  blurUrl: string;
  data: sharp.Sharp;
}

type ImageCache = Map<string, CachedImage>;

export interface ViteImgParams {
  sizes?: number[];
}

export default function viteImg({
  sizes = [320, 640, 768, 1024, 1280, 1536, 2560],
}: ViteImgParams = {}): Plugin {
  let config: ResolvedConfig;
  const imageCache = new Map<string, CachedImage>() satisfies ImageCache;

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
          const { src, width, height, blurUrl } = await loadImage({ id, cache: imageCache, config });

          return `
            export default {
              src: "${src}",
              width: ${width},
              height: ${height},
              blurUrl: "${blurUrl}",
            }
          `;
        }
      },
    },

    async generateBundle() {
      if (!config.build.ssr) {
        return;
      }

      await Promise.all(Array.from(imageCache.values()).map(async ({ src, data }) => {
        this.emitFile({
          type: 'asset',
          fileName: src,
          source: await data.toBuffer(),
        });
      }));
    }
  };
}

async function loadImage({ id, cache, config }: { id: string, cache: ImageCache, config: ResolvedConfig }) {
  const cached = cache.get(id);
  if (cached) {
    const { data, ...rest } = cached;
    return rest;
  }

  const data = await fs.readFile(id);

  const image = sharp(data);
  const blurBuffer = await image
    .clone()
    .png()
    .resize({ width: 10 })
    .toBuffer();
  image.webp({ quality: 100 });
  const metadata = await image.metadata();
  const hash = crypto.createHash('sha512').update(await image.toBuffer()).digest('hex').slice(0, 8);

  const extname = path.extname(id);
  const relativePath = path.relative(config.root, id);
  const src = config.command === "build"
    ? `${config.build.assetsDir}/${path.basename(id, extname)}-${hash}.webp`
    : relativePath;

  const result = {
    src,
    width: metadata.width,
    height: metadata.height,
    blurUrl: `data:image/png;base64,${blurBuffer.toString("base64")}`,
  };

  cache.set(id, { ...result, data: image });

  return result;
}