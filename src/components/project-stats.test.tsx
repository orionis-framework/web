import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectStats } from './project-stats';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockStats(version: string | null) {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse({ stargazers_count: 23 }))
    .mockResolvedValueOnce(jsonResponse({ info: { version } }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderStats(version: string | null) {
  return render(
    <ProjectStats
      initialStats={{ stars: 23, version }}
      locale="es"
      starsLabel="Stars"
      versionLabel="PyPI version"
      unavailableLabel="Unavailable"
    />,
  );
}

describe('project statistics display', () => {
  it.each(['0.900.0', '1.0.0rc1', '1.0.0', '2.0.0'])(
    'reveals the confirmed PyPI version %s after the lookup',
    async (version) => {
      mockStats(version);
      renderStats(version);

      const pypiCard = screen.getByRole('link', { name: /PyPI/ });
      expect(pypiCard).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText(`v${version}`)).not.toBeInTheDocument();
      expect(screen.getByText('PyPI')).toBeVisible();
      expect(screen.getByText('23')).toBeVisible();
      await waitFor(() => expect(screen.getByText(`v${version}`)).toBeVisible());
      expect(pypiCard).toHaveAttribute('aria-busy', 'false');
    },
  );

  it('shows an unavailable label only after the lookup has no known PyPI version', async () => {
    mockStats(null);
    renderStats(null);

    const pypiCard = screen.getByRole('link', { name: /PyPI/ });
    expect(screen.getByText('PyPI')).toBeVisible();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
    expect(screen.getByText('PyPI version')).toBeVisible();
    await waitFor(() => expect(pypiCard).toHaveAttribute('aria-busy', 'false'));
    expect(screen.getByText('Unavailable')).toBeVisible();
  });

  it('never flashes the stale build version while waiting for the latest PyPI response', async () => {
    let resolvePyPI!: (response: Response) => void;
    const pendingPyPI = new Promise<Response>((resolve) => {
      resolvePyPI = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ stargazers_count: 23 }))
      .mockReturnValueOnce(pendingPyPI);
    vi.stubGlobal('fetch', fetchMock);
    renderStats('0.803.0');
    const pypiCard = screen.getByRole('link', { name: /PyPI/ });
    expect(screen.queryByText('v0.803.0')).not.toBeInTheDocument();
    expect(screen.getByText('PyPI')).toBeVisible();
    expect(pypiCard).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolvePyPI(jsonResponse({ info: { version: '1.0.9' } }));
    });

    await waitFor(() => expect(screen.getByText('v1.0.9')).toBeVisible());
    expect(screen.queryByText('v0.803.0')).not.toBeInTheDocument();
    expect(pypiCard).toHaveAttribute('aria-busy', 'false');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://api.github.com/repos/orionis-framework/framework',
      'https://pypi.org/pypi/orionis/json',
    ]);
  });

  it('loads the latest PyPI version when the initial version is missing', async () => {
    mockStats('1.0.0');
    renderStats(null);
    expect(screen.getByText('PyPI')).toBeVisible();

    await waitFor(() => expect(screen.getByText('v1.0.0')).toBeVisible());
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  });

  it.each([null, '0.900.0'])(
    'preserves the known version %s when PyPI is unavailable',
    async (version) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ stargazers_count: 42 }))
        .mockRejectedValueOnce(new TypeError('Network error'));
      vi.stubGlobal('fetch', fetchMock);
      renderStats(version);

      const pypiCard = screen.getByRole('link', { name: /PyPI/ });
      expect(pypiCard).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('PyPI')).toBeVisible();
      if (version !== null) expect(screen.queryByText(`v${version}`)).not.toBeInTheDocument();
      await waitFor(() => expect(screen.getByText('42')).toBeVisible());
      expect(pypiCard).toHaveAttribute('aria-busy', 'false');
      if (version === null) {
        expect(screen.getByText('PyPI')).toBeVisible();
        expect(screen.getByText('Unavailable')).toBeVisible();
      } else {
        expect(screen.getByText(`v${version}`)).toBeVisible();
      }
    },
  );

  it('reveals the latest PyPI version even when GitHub cannot refresh', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('{}', { status: 403 }))
        .mockResolvedValueOnce(jsonResponse({ info: { version: '1.0.9' } })),
    );
    renderStats('0.803.0');
    expect(screen.queryByText('v0.803.0')).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('v1.0.9')).toBeVisible());
    expect(screen.getByText('23')).toBeVisible();
    expect(screen.queryByText('v0.803.0')).not.toBeInTheDocument();
  });

  it('cancels the refresh when the component unmounts', () => {
    const fetchMock = mockStats('1.0.0');
    const view = renderStats('0.900.0');
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);

    view.unmount();

    expect(signal.aborted).toBe(true);
  });
});
