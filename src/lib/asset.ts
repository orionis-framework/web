/**
 * GitHub Pages project sites are served from a sub-path
 * (e.g. https://<user>.github.io/web-orionis/).
 * `NEXT_PUBLIC_BASE_PATH` is inlined at build time by Next.js,
 * so this helper works both on the server and in the browser.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || '';

/** Prefix a public asset path with the configured base path. */
export function asset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
