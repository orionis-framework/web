import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-static';

export async function GET() {
  const favicon = await readFile(join(process.cwd(), 'public', 'favicon.svg'), 'utf8');

  return new Response(favicon, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}