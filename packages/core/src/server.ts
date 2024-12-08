import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import type { UrlParams } from ".";

interface Cache {
  read(params: UrlParams): Promise<Uint8Array | undefined>;
  write(params: UrlParams, data: Uint8Array): Promise<void>;
}

class MemoryCache implements Cache {
  private cache = new Map<string, Uint8Array>();

  async read(params: UrlParams) {
    return this.cache.get(`${params.src}-${params.q}-${params.w}`);
  }

  async write(params: UrlParams, data: Uint8Array) {
    this.cache.set(`${params.src}-${params.q}-${params.w}`, data);
  }
}

class FsCache implements Cache {
  private static readonly CACHE_DIR = new URL(
    ".cache/vite-img",
    import.meta.url
  ).pathname;

  async read(params: UrlParams) {
    const hash = crypto
      .createHash("sha512")
      .update(`${params.src}-${params.q}-${params.w}`)
      .digest("hex");
    const cachePath = path.join(FsCache.CACHE_DIR, `${hash}.webp`);
    try {
      return await fs.readFile(cachePath);
    } catch {
      return undefined;
    }
  }

  async write(params: UrlParams, data: Uint8Array) {
    const hash = crypto
      .createHash("sha512")
      .update(`${params.src}-${params.q}-${params.w}`)
      .digest("hex");
    const cachePath = path.join(FsCache.CACHE_DIR, `${hash}.webp`);
    await fs.mkdir(FsCache.CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, data);
  }
}

const cache: Cache =
  process.env.NODE_ENV === "development" ? new MemoryCache() : new FsCache();

export async function apiRoute(request: Request) {
  try {
    const params = await getParams(request.url);
    const image = await getOrInsert(params);
    const data = await image.toBuffer();
    return new Response(data, {
      status: 200,
      headers: { "content-type": "image/webp" },
    });
  } catch (err) {
    if (err instanceof Response) {
      return err;
    }

    return Response.json(
      {
        success: false,
        error: {
          code: 500,
          message: "Internal server error.",
        },
      },
      { status: 500 }
    );
  }
}

async function openImage(src: string) {
  const res = await fetch(src);
  return sharp(await res.arrayBuffer());
}

async function getOrInsert(params: UrlParams) {
  const cached = await cache.read(params);
  if (cached) {
    return sharp(cached);
  }

  const image = await openImage(params.src);
  image.webp({ quality: params.q });
  if (params.w != null) {
    image.resize({ width: params.w });
  }

  await cache.write(params, await image.toBuffer());

  return image;
}

async function getParams(requestUrl: string) {
  const url = new URL(requestUrl);
  const src = url.searchParams.get("src");
  if (src === null) {
    throw Response.json(
      {
        success: false,
        error: {
          code: 400,
          message: "Missing src search parameter.",
        },
      },
      { status: 400 }
    );
  }
  const quality = url.searchParams.get("q") ?? "75";
  const width = url.searchParams.get("w");
  return {
    src: new URL(src, requestUrl).toString(),
    q: Number(quality),
    w: width != null ? Number(width) : undefined,
  };
}
