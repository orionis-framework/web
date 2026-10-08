import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreviewNotice, ProjectStats, ProjectStatsProvider } from './project-stats';
import englishMessages from '@/i18n/messages/en.json';
import spanishMessages from '@/i18n/messages/es.json';
import type { Locale } from '@/i18n/routing';

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

function renderStats(version: string | null, locale: Locale = 'es') {
  const messages = locale === 'es' ? spanishMessages : englishMessages;
  return render(
    <ProjectStatsProvider initialStats={{ stars: 23, version }}>
      <PreviewNotice message={messages.Home.previewNotice} />
      <ProjectStats
        locale={locale}
        starsLabel="Stars"
        versionLabel="PyPI version"
        unavailableLabel="Unavailable"
      />
    </ProjectStatsProvider>,
  );
}

describe('preview release notice', () => {
  it.each(['0.900.0', '1.0.0rc1', '1.0.0.dev1'])(
    'shows the notice for the initial PyPI version %s',
    (version) => {
      mockStats(version);
      renderStats(version);

      expect(screen.getByRole('status')).toHaveTextContent(spanishMessages.Home.previewNotice);
      expect(screen.getByText(`v${version}`)).toBeVisible();
    },
  );

  it.each([null, '1.0.0', '1.1.0', '2.0.0'])(
    'omits the notice for a missing or stable version %s',
    (version) => {
      mockStats(version);
      renderStats(version);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    },
  );

  it('uses the English message on the English page', () => {
    mockStats('0.900.0');
    renderStats('0.900.0', 'en');

    expect(screen.getByRole('status')).toHaveTextContent(englishMessages.Home.previewNotice);
  });

  it('removes the notice and updates the displayed version from the same refresh', async () => {
    const fetchMock = mockStats('1.0.0');
    renderStats('0.900.0');
    expect(screen.getByRole('status')).toBeVisible();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeVisible();
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://api.github.com/repos/orionis-framework/framework',
      'https://pypi.org/pypi/orionis/json',
    ]);
  });

  it.each([null, '1.0.0'])(
    'shows the notice when the browser refresh returns a preview version after %s',
    async (initialVersion) => {
      mockStats('0.900.0');
      renderStats(initialVersion);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeVisible();
        expect(screen.getByText('v0.900.0')).toBeVisible();
      });
    },
  );

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
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.getByText('PyPI')).toBeVisible();
      } else {
        expect(screen.getByRole('status')).toBeVisible();
        expect(screen.getByText(`v${version}`)).toBeVisible();
      }
    },
  );

  it('cancels the shared refresh when the provider unmounts', () => {
    const fetchMock = mockStats('1.0.0');
    const view = renderStats('0.900.0');
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);

    view.unmount();

    expect(signal.aborted).toBe(true);
  });
});
