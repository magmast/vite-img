import { default as sharp } from "sharp";
import { type Plugin, Connect } from "vite";
import crypto from "crypto";
import fs from "fs/promises";

export interface ReactImageParams {
  sizes?: number[];
}

export default function reactImage({
  sizes = [320, 640, 768, 1024, 1280, 1536, 2560],
}: ReactImageParams = {}): Plugin {
  const sizesLoader = createSizesLoader(sizes);

  const imageLoader = createImageLoader();

  return {
    name: "vite-img",

    configureServer(server) {
      server.middlewares.use(imageLoader.middleware);
    },

    resolveId(id) {
      return sizesLoader.resolveId(id);
    },

    load: {
      order: "pre",
      async handler(id) {
        const sizesResult = sizesLoader.load(id);
        if (sizesResult != null) {
          return sizesResult;
        }

        const imageResult = await imageLoader.load(id);
        if (imageResult != null) {
          return imageResult;
        }
      },
    },
  };
}

function createSizesLoader(sizes: number[]) {
  const sizesModule = "virtual:vite-img/sizes";

  const resolvedSizesModule = `\0${sizesModule}`;

  return {
    resolveId(id: string) {
      if (id === sizesModule) {
        return resolvedSizesModule;
      }
    },

    load(id: string) {
      if (id !== resolvedSizesModule) {
        return;
      }

      return `
        export default [${sizes.map((size) => size.toString()).join(", ")}];
      `;
    },
  };
}

function createImageLoader() {
  const cache = new Map<string, sharp.Sharp>();

  const imageIdRegexp = /\.(png|jpe?g)$/;

  return {
    middleware: (async (req, res, next) => {
      if (!req.url) {
        next();
        return;
      }

      const [path, query] = req.url.split("?");

      const components = path.split("/").filter(Boolean);
      if (components.at(0) !== "vite-img") {
        next();
        return;
      }

      const hash = components.at(1);
      if (hash == null) {
        throw new Error("Image hash is required.");
      }

      const image = cache.get(hash)?.clone();
      if (image == null) {
        throw new Error("Image not found.");
      }

      const searchParams = new URLSearchParams(query);

      const width = searchParams.get("w");
      if (width != null) {
        image.resize({
          width: Number(width),
          fit: "contain",
        });
      }

      const quality = searchParams.get("q") ?? "75";
      image.webp({ quality: Number(quality) });

      res.setHeader("content-type", "image/webp");
      res.end(await image.toBuffer());
    }) as Connect.NextHandleFunction,

    async load(id: string) {
      if (!imageIdRegexp.test(id)) {
        return;
      }

      if (!imageIdRegexp.test(id)) {
        return;
      }

      const data = await fs.readFile(id);

      const hash = crypto
        .createHash("sha512")
        .update(data as unknown as Uint8Array)
        .digest("base64url");

      const image = sharp(data);
      cache.set(hash, image);

      const metadata = await image.metadata();

      const blurBuffer = await image
        .clone()
        .png()
        .resize({ width: 10 })
        .toBuffer();

      return `
        export default {
          src: "/vite-img/${hash}",
          width: ${metadata.width},
          height: ${metadata.height},
          blurUrl: "data:image/png;base64,${blurBuffer.toString("base64")}",
        }
      `;
    },
  };
}
