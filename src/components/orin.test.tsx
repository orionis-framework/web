import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LocalizedNotFound } from './localized-not-found';
import { Orin } from './orin';
import { SiteHeader } from './site-header';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import { documentationUrl } from '@/lib/site';

const messages = { en, es };

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  vi.unstubAllGlobals();
});

it.each(['en', 'es'] as const)(
  'renders recovery links in the language of the missing %s URL',
  (locale) => {
    window.history.replaceState({}, '', `/${locale}/missing/route/`);
    render(<LocalizedNotFound messages={messages} />);
    const copy = messages[locale].NotFound;
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(copy.title);
    expect(screen.getByRole('link', { name: copy.home })).toHaveAttribute('href', `/${locale}/`);
    expect(screen.getByRole('link', { name: copy.docs })).toHaveAttribute(
      'href',
      documentationUrl(locale),
    );
    expect(screen.getByRole('img', { name: messages[locale].Orin.alt.explore })).toHaveAttribute(
      'src',
      '/images/orin/orin-explore.webp',
    );
  },
);

it.each(['en', 'es'] as const)(
  'keeps %s Orin navigation and decorative images accessible',
  (locale) => {
    const other = locale === 'en' ? 'es' : 'en';
    render(
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
        <SiteHeader locale={locale} page="orin" />
        <Orin variant="wave" decorative />
        <Orin variant="star" />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole('link', { name: messages[locale].Home.nav.switchLocale }),
    ).toHaveAttribute('href', `/${other}/orin/`);
    expect(
      screen.getByRole('link', { name: messages[locale].Home.nav.architecture }),
    ).toHaveAttribute('href', `/${locale}/#architecture`);
    expect(screen.getByRole('img', { name: messages[locale].Orin.alt.star })).toHaveAttribute(
      'loading',
      'lazy',
    );
    const wave = document.querySelector('img[src$="/orin-wave.webp"]');
    expect(wave).toHaveAttribute('alt', '');
    expect(wave).toHaveAttribute('width');
    expect(wave).toHaveAttribute('height');
  },
);
