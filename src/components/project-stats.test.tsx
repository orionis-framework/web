import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
    'shows the initial PyPI version %s',
    (version) => {
      mockStats(version);
      renderStats(version);

      expect(screen.getByText(`v${version}`)).toBeVisible();
      expect(screen.getByText('23')).toBeVisible();
    },
  );

  it('shows an unavailable label when the PyPI version is missing', () => {
    mockStats(null);
    renderStats(null);

    expect(screen.getByText('PyPI')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
  });

  it('updates the displayed version with one request per official API', async () => {
    const fetchMock = mockStats('1.0.0');
    renderStats('0.900.0');
    expect(screen.getByText('v0.900.0')).toBeVisible();

    await waitFor(() => expect(screen.getByText('v1.0.0')).toBeVisible());
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

      await waitFor(() => expect(screen.getByText('42')).toBeVisible());
      if (version === null) {
        expect(screen.getByText('PyPI')).toBeVisible();
      } else {
        expect(screen.getByText(`v${version}`)).toBeVisible();
      }
    },
  );

  it('cancels the refresh when the component unmounts', () => {
    const fetchMock = mockStats('1.0.0');
    const view = renderStats('0.900.0');
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);

    view.unmount();

    expect(signal.aborted).toBe(true);
  });
});
