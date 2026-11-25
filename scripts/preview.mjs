import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path/posix';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import sirv from 'sirv';

const { values } = parseArgs({
  options: {
    host: { type: 'string', short: 'H', default: process.env.HOST || '127.0.0.1' },
    port: { type: 'string', short: 'p', default: process.env.PORT || '4173' },
  },
});
const output = new URL('../out/', import.meta.url);
const notFound = new URL('404.html', output);

function isPageRequest(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  let pathname;
  try {
    pathname = decodeURI(request.url.split('?')[0]);
  } catch {
    return false;
  }
  if (/\/(?:api|_next|assets|images|licenses|\.well-known)(?:\/|$)/.test(pathname)) return false;
  const extension = extname(pathname).toLowerCase();
  if (extension && extension !== '.html' && extension !== '.htm') return false;

  return (
    request.headers['sec-fetch-mode'] === 'navigate' ||
    (request.headers.accept || '').split(',').some((entry) => {
      const [type, ...parameters] = entry.trim().toLowerCase().split(';');
      return (
        type.trim() === 'text/html' && !parameters.some((p) => /^\s*q\s*=\s*0(?:\.0*)?\s*$/.test(p))
      );
    })
  );
}

const serve = sirv(fileURLToPath(output), {
  dev: true,
  gzip: true,
  brotli: true,
  async onNoMatch(request, response) {
    response.statusCode = 404;
    if (isPageRequest(request)) {
      const html = await readFile(notFound).catch(() => null);
      if (html) {
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Content-Length', html.length);
        response.setHeader('Cache-Control', 'no-store');
        response.end(request.method === 'HEAD' ? undefined : html);
        return;
      }
    }
    response.end();
  },
});

createServer(serve).listen(Number(values.port), values.host, function () {
  console.log(`Preview listening on http://${values.host}:${this.address().port}/`);
});
