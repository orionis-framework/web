import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { asset } from '@/lib/asset';
import { localeUrl, site } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(locales.map((locale) => [locale, localeUrl(locale)])),
    'x-default': new URL(asset('/'), site.url).href,
  };

  return locales.map((locale) => ({
    url: localeUrl(locale),
    changeFrequency: 'monthly',
    priority: locale === 'en' ? 1 : 0.9,
    alternates: { languages },
  }));
}
