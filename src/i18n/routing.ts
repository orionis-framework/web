import { defineRouting } from 'next-intl/routing';

/**
 * Shared routing configuration for the whole application.
 * Add or remove locales here — every part of the site (navigation,
 * static params, SEO alternates) derives from this single source.
 */
export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
