import type { APIEvent } from '@solidjs/start/server';
import { GET as handler } from '@vite-img/solid-start';

export async function GET(event: APIEvent) {
  return await handler(event);
}
