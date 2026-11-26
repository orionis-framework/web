import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LocalizedNotFound } from './localized-not-found';
import { Cosmo } from './cosmo';
import { CosmoGallery } from './cosmo-gallery';
import { SiteHeader } from './site-header';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import { documentationUrl } from '@/lib/site';

const messages = { en, es };

it.each(['en', 'es'] as const)(
  'keeps the %s gallery downloads available when filtering',
  (locale) => {
    const copy = messages[locale].Cosmo;
    render(
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
        <CosmoGallery />
      </NextIntlClientProvider>,
    );
    const grid = within(screen.getByRole('list'));
    const all = grid.getAllByRole('listitem');
    expect(all).toHaveLength(Object.keys(copy.galleryItems).length);
    for (const card of all) {
      const [preview, download] = within(card).getAllByRole('link');
      expect(preview).toHaveAttribute('href', download.getAttribute('href'));
      expect(download.getAttribute('download')).toMatch(/^cosmo-.*\.webp$/);
    }
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.filterTogether) }));
    expect(grid.getAllByRole('listitem')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.filterSolo) }));
    expect(grid.getAllByRole('listitem')).toHaveLength(all.length - 3);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.filterAll) }));
    expect(grid.getAllByRole('listitem')).toHaveLength(all.length);
    expect(screen.getByRole('link', { name: copy.downloadAll })).toHaveAttribute(
      'download',
      'cosmo-gallery.zip',
    );
  },
);

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
    expect(screen.getByRole('img', { name: messages[locale].Cosmo.alt.explore })).toHaveAttribute(
      'src',
      '/images/cosmo/cosmo-explore.webp',
    );
  },
);

it.each(['en', 'es'] as const)(
  'keeps %s Cosmo navigation and decorative images accessible',
  (locale) => {
    const other = locale === 'en' ? 'es' : 'en';
    render(
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
        <SiteHeader locale={locale} page="cosmo" />
        <Cosmo variant="wave" decorative />
        <Cosmo variant="star" />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole('link', { name: messages[locale].Home.nav.switchLocale }),
    ).toHaveAttribute('href', `/${other}/cosmo/`);
    expect(
      screen.getByRole('link', { name: messages[locale].Home.nav.architecture }),
    ).toHaveAttribute('href', `/${locale}/#architecture`);
    expect(screen.getByRole('img', { name: messages[locale].Cosmo.alt.star })).toHaveAttribute(
      'loading',
      'lazy',
    );
    const wave = document.querySelector('img[src$="/cosmo-wave.webp"]');
    expect(wave).toHaveAttribute('alt', '');
    expect(wave).toHaveAttribute('width');
    expect(wave).toHaveAttribute('height');
  },
);
