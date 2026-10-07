import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPageMetadata, localeUrl, site } from './site';
import sitemap from '@/app/sitemap';
import packageInfo from '../../package.json';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('official site metadata', () => {
  it('uses the requested author and project installer consistently', () => {
    expect(site.author).toBe('Raul Mauricio U\u00f1ate & Orionis Team');
    expect(packageInfo.author).toBe(site.author);
    expect(site.installCommand).toBe('uvx --from orionis-installer orionis new');
    expect(getPageMetadata('en').authors).toEqual([{ name: site.author }]);
  });

  it('publishes localized canonical URLs and language alternatives', () => {
    for (const locale of ['en', 'es'] as const) {
      expect(getPageMetadata(locale)).toMatchObject({
        alternates: {
          canonical: `${site.url}/${locale}/`,
          languages: { en: `${site.url}/en/`, es: `${site.url}/es/`, 'x-default': `${site.url}/` },
        },
        openGraph: { locale: locale === 'es' ? 'es_ES' : 'en_US', url: localeUrl(locale) },
      });
    }
    expect(getPageMetadata('en').description).not.toBe(getPageMetadata('es').description);
  });

  it('uses the local SEO image with its actual dimensions for social previews', () => {
    expect(getPageMetadata('es')).toMatchObject({
      openGraph: {
        images: [
          { url: `${site.url}/images/seo/seo.png`, width: 1731, height: 909, type: 'image/png' },
        ],
      },
      twitter: { card: 'summary_large_image', images: [{ url: `${site.url}/images/seo/seo.png` }] },
    });
  });

  it('lists only canonical locale pages in the sitemap', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([`${site.url}/en/`, `${site.url}/es/`]);
    expect(sitemap()[0].alternates?.languages).toEqual({
      en: `${site.url}/en/`,
      es: `${site.url}/es/`,
      'x-default': `${site.url}/`,
    });
  });

  it('preserves project sub-paths in canonical and social-image URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/orionis-web');
    const { getPageMetadata: getPrefixedMetadata } = await import('./site');
    expect(getPrefixedMetadata('es')).toMatchObject({
      alternates: { canonical: `${site.url}/orionis-web/es/` },
      openGraph: { images: [{ url: `${site.url}/orionis-web/images/seo/seo.png` }] },
    });
  });
});
