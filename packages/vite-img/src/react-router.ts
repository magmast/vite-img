import { type LoaderFunctionArgs } from 'react-router'
import sharp from 'sharp';

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const src = searchParams.get('src');
  if (src === null) {
    return new Response(null, { status: 400 })
  }

  const image = await openImage(src);

  const quality = searchParams.get('q') ?? '75';
  image.webp({ quality: Number(quality) })

  const width = searchParams.get('w');
  if (width != null) {
    image.resize({ width: Number(width) });
  }

  return new Response(
    await image.toBuffer(),
    {
      status: 200,
      headers: { 'content-type': 'image/webp' }
    }
  );
}

async function openImage(src: string) {
  const url = new URL(src, import.meta.url);
  if (url.protocol === 'file:') {
    return sharp(url.pathname);
  }

  const res = await fetch(src);
  const data = await res.arrayBuffer();
  return sharp(data);
}