import { type LoaderFunctionArgs } from 'react-router'
import crypto from 'crypto';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const cacheDir = new URL(".cache/vite-img", import.meta.url).pathname;

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const src = searchParams.get('src');
  if (src === null) {
    return Response.json(
      {
        success: false,
        error: {
          code: 400,
          message: "Missing src search parameter."
        }
      },
      { status: 400 }
    )
  }

  const quality = searchParams.get('q') ?? '75';
  const width = searchParams.get('w');
  const hash = crypto.createHash('sha512').update(`${src}-${quality}-${width}`).digest('hex');
  const cachePath = path.join(cacheDir, `${hash}.webp`);

  let data: Buffer;
  try {
    data = await fs.readFile(cachePath);
  } catch {
    const image = await openImage(src);
    image.webp({ quality: Number(quality) })
    if (width != null) {
      image.resize({ width: Number(width) });
    }

    data = await image.toBuffer();
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cachePath, data);
  }

  return new Response(
    data,
    {
      status: 200,
      headers: { 'content-type': 'image/webp' }
    }
  );
}

async function openImage(src: string) {
  const url = new URL(src, process.env.NODE_ENV === "development" ? `file://${process.cwd()}/index.js` : import.meta.url);
  if (url.protocol === 'file:') {
    console.log(url.pathname);
    return sharp(url.pathname);
  }

  const res = await fetch(src);
  const data = await res.arrayBuffer();
  return sharp(data);
}