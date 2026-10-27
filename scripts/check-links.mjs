import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

const outputDirectory = resolve('out');
const origin = 'https://orionis-framework.com';
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH?.trim() || '').replace(/\/$/, '');
const checkExternal = process.argv.includes('--external');
const failures = [];
const externalUrls = new Set();
const documents = new Map();
let localReferences = 0;

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

function decodeAttribute(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, decimal) =>
      String.fromCodePoint(Number.parseInt(hex || decimal, hex ? 16 : 10)),
    );
}

async function targetFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (basePath && decoded !== basePath && !decoded.startsWith(`${basePath}/`)) return null;
  const relative = basePath ? decoded.slice(basePath.length) : decoded;
  const candidate = resolve(outputDirectory, `.${relative}`);
  if (candidate !== outputDirectory && !candidate.startsWith(`${outputDirectory}${sep}`))
    return null;
  for (const path of [candidate, join(candidate, 'index.html')]) {
    try {
      if ((await stat(path)).isFile()) return path;
    } catch {
      // Try the directory index used by the static host.
    }
  }
  return null;
}

let files;
try {
  files = await htmlFiles(outputDirectory);
} catch {
  console.error('No static export found. Run npm run build before checking links.');
  process.exit(1);
}

for (const file of files) {
  documents.set(file, await readFile(file, 'utf8'));
}

for (const [file, html] of documents) {
  const relative = file.slice(outputDirectory.length).replaceAll(sep, '/');
  const pathname = relative.endsWith('/index.html')
    ? `${relative.slice(0, -'index.html'.length)}`
    : relative;
  const pageUrl = new URL(`${basePath}${pathname}`, origin);

  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const reference = decodeAttribute(match[1]);
    if (/^(?:data|blob|mailto|tel):/i.test(reference)) continue;
    let url;
    try {
      url = new URL(reference, pageUrl);
    } catch {
      failures.push(`${relative}: invalid URL ${reference}`);
      continue;
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      failures.push(`${relative}: unsupported URL ${reference}`);
      continue;
    }
    if (url.origin !== origin) {
      url.hash = '';
      externalUrls.add(url.href);
      continue;
    }

    localReferences++;
    const target = await targetFile(url.pathname);
    if (!target) {
      failures.push(`${relative}: missing page or asset ${reference}`);
      continue;
    }
    if (url.hash && documents.has(target)) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      const ids = [...documents.get(target).matchAll(/\bid=["']([^"']+)["']/g)].map((id) =>
        decodeAttribute(id[1]),
      );
      if (!ids.includes(fragment)) failures.push(`${relative}: missing anchor ${reference}`);
    }
  }
}

if (checkExternal) {
  const pending = [...externalUrls];
  await Promise.all(
    Array.from({ length: Math.min(4, pending.length) }, async () => {
      while (pending.length) {
        const url = pending.pop();
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
          await response.body?.cancel();
          if (!response.ok) failures.push(`${url}: HTTP ${response.status}`);
        } catch (error) {
          failures.push(`${url}: ${error.message}`);
        }
      }
    }),
  );
}

if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${files.length} HTML files and ${localReferences} local links/assets; ` +
      `${externalUrls.size} external destinations ${checkExternal ? 'verified' : 'found (use --external to verify)'}.`,
  );
}
