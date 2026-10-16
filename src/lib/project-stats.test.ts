import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadProjectStats } from './project-stats';

afterEach(() => vi.unstubAllGlobals());

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('project statistics', () => {
  it('reads stars and the published PyPI version from the official APIs', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ stargazers_count: 23 }))
      .mockResolvedValueOnce(jsonResponse({ info: { version: '0.900.0' } }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await loadProjectStats()).toEqual({ stars: 23, version: '0.900.0' });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://api.github.com/repos/orionis-framework/framework',
      'https://pypi.org/pypi/orionis/json',
    ]);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      cache: 'no-store',
      signal: expect.any(AbortSignal),
    });
  });

  it('keeps the PyPI version when GitHub is rate limited', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({}, 403))
        .mockResolvedValueOnce(jsonResponse({ info: { version: '1.0.0rc1' } })),
    );

    expect(await loadProjectStats()).toEqual({ stars: null, version: '1.0.0rc1' });
  });

  it('keeps the stars when PyPI is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ stargazers_count: 0 }))
        .mockRejectedValueOnce(new TypeError('Network error')),
    );

    expect(await loadProjectStats()).toEqual({ stars: 0, version: null });
  });

  it('rejects malformed API values instead of inventing project data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ stargazers_count: '23' }))
        .mockResolvedValueOnce(jsonResponse({ info: { version: '<invalid>' } })),
    );

    expect(await loadProjectStats()).toEqual({ stars: null, version: null });
  });

  it('gracefully handles cancellation or offline builds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));
    const controller = new AbortController();
    controller.abort();

    expect(await loadProjectStats({ signal: controller.signal })).toEqual({
      stars: null,
      version: null,
    });
  });

  it('allows build-time caching without caching browser refreshes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await loadProjectStats({ cache: 'force-cache' });
    expect(fetchMock.mock.calls[0][1].cache).toBe('force-cache');
  });
});
