import type { Metadata } from 'next';
import { asset } from './asset';
import { locales, type Locale } from '@/i18n/routing';

/**
 * Single source of truth for external links and global site metadata.
 */
export const site = {
  name: 'Orionis',
  fullName: 'Orionis Framework',
  author: 'Raul Mauricio U\u00f1ate & Orionis Team',
  url: 'https://orionis-framework.com',
  installCommand: 'uvx --from orionis-installer orionis new',
  socialImage: '/images/seo/seo.png',
  granian: {
    url: 'https://github.com/emmett-framework/granian',
    logo: '/images/brands/granian.png',
    license: '/licenses/granian-BSD-3-Clause.txt',
  },
  repo: 'https://github.com/orionis-framework/framework',
  docs: 'https://docs.orionis-framework.com/en/introduction/prologue/',
  apiReference: 'https://api.orionis-framework.com/',
  pypi: 'https://pypi.org/project/orionis/',
} as const;

export const nav: { key: string; href: string }[] = [
  { key: 'features', href: '#features' },
  { key: 'architecture', href: '#architecture' },
  { key: 'examples', href: '#examples' },
  { key: 'ecosystem', href: '#ecosystem' },
];

const metadataContent: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Orionis Framework | Async-First Python, Powered by Rust',
    description:
      'Build Python applications with Orionis: Rust-powered HTTP, ASGI/RSGI, WebSockets, SSE, realtime hubs, async ORM, queues, cache and native MCP.',
  },
  es: {
    title: 'Orionis Framework | Python Async-First con motor Rust',
    description:
      'Crea aplicaciones Python con Orionis: HTTP sobre Rust, ASGI/RSGI, WebSockets, SSE, realtime, ORM as\u00edncrono, queues, cach\u00e9 y MCP nativo.',
  },
};

export function localeUrl(locale: Locale): string {
  return new URL(asset(`/${locale}/`), site.url).href;
}

export function getPageMetadata(locale: Locale): Metadata {
  const content = metadataContent[locale];
  const image = {
    url: new URL(asset(site.socialImage), site.url).href,
    width: 1731,
    height: 909,
    type: 'image/png',
    alt: 'Orionis Framework: async-first Python, powered by Rust.',
  };

  return {
    metadataBase: new URL(site.url),
    title: content.title,
    description: content.description,
    applicationName: site.fullName,
    authors: [{ name: site.author }],
    creator: site.author,
    publisher: 'Orionis Team',
    keywords: [
      'Orionis',
      'Python',
      'async-first',
      'Granian',
      'ASGI',
      'RSGI',
      'WebSockets',
      'SSE',
      'ORM',
      'MCP',
    ],
    alternates: {
      canonical: localeUrl(locale),
      languages: {
        ...Object.fromEntries(locales.map((language) => [language, localeUrl(language)])),
        'x-default': new URL(asset('/'), site.url).href,
      },
    },
    openGraph: {
      type: 'website',
      url: localeUrl(locale),
      siteName: site.fullName,
      title: content.title,
      description: content.description,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? ['en_US'] : ['es_ES'],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [{ url: image.url, alt: image.alt }],
    },
    robots: { index: true, follow: true },
    icons: { icon: asset('/favicon.svg') },
  };
}
