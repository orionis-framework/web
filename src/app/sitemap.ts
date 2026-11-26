import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { languageAlternates, localeUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', 'cosmo/'] as const;
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: localeUrl(locale, path),
      changeFrequency: 'monthly',
      priority: path ? 0.6 : locale === 'en' ? 1 : 0.9,
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
