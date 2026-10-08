export interface ProjectStats {
  stars: number | null;
  version: string | null;
}

interface StatsOptions {
  cache?: RequestCache;
  signal?: AbortSignal;
}

function readStars(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object' || !('stargazers_count' in payload)) return null;
  const value = payload.stargazers_count;
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function readVersion(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('info' in payload)) return null;
  const info = payload.info;
  if (!info || typeof info !== 'object' || !('version' in info)) return null;
  const version = info.version;
  return typeof version === 'string' && /^\d[\da-zA-Z.!+_-]{0,63}$/.test(version) ? version : null;
}

export function isPreviewVersion(version: string | null): boolean {
  const match = version?.match(
    /^(?:(\d+)!)?(\d+(?:\.\d+)*)([-_.]?(?:alpha|beta|preview|pre|rc|a|b|c)[-_.]?\d*)?(-\d+|[-_.]?(?:post|rev|r)[-_.]?\d*)?([-_.]?dev[-_.]?\d*)?(?:\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?$/i,
  );
  if (!match) return false;

  const [, epoch = '0', release, prerelease, postrelease, development] = match;
  if (Number(epoch) > 0) return false;

  const [major, ...remaining] = release.split('.').map(Number);
  if (major !== 1) return major < 1;
  if (remaining.some((part) => part > 0)) return false;

  return Boolean(prerelease || (development && !postrelease));
}

export async function loadProjectStats({
  cache = 'no-store',
  signal,
}: StatsOptions = {}): Promise<ProjectStats> {
  const timeout = AbortSignal.timeout(6000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  async function request(url: string): Promise<unknown> {
    const response = await fetch(url, {
      cache,
      signal: requestSignal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Project data unavailable: ${response.status}`);
    return response.json();
  }

  const [github, pypi] = await Promise.allSettled([
    request('https://api.github.com/repos/orionis-framework/framework'),
    request('https://pypi.org/pypi/orionis/json'),
  ]);

  return {
    stars: github.status === 'fulfilled' ? readStars(github.value) : null,
    version: pypi.status === 'fulfilled' ? readVersion(pypi.value) : null,
  };
}
