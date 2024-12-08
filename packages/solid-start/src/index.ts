import type { APIEvent } from '@solidjs/start/server';
import { apiRoute } from '@vite-img/core/server';

export async function GET({ request }: APIEvent) {
  return await apiRoute(request);
}