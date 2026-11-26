'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { NextIntlClientProvider, useTranslations, type AbstractIntlMessages } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { defaultLocale, locales, type Locale } from '@/i18n/routing';
import { asset, basePath } from '@/lib/asset';
import { documentationUrl } from '@/lib/site';
import { Cosmo } from './cosmo';
import styles from './cosmo-page.module.css';
import { SiteHeader } from './site-header';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

function locationLocale(): Locale {
  const path = window.location.pathname.slice(basePath.length).split('/')[1];
  return locales.find((locale) => locale === path) ?? defaultLocale;
}

function ErrorContent({ locale }: { locale: Locale }) {
  const t = useTranslations('NotFound');
  const nav = useTranslations('Home.nav');
  return (
    <div lang={locale} className="site-shell">
      <a className="skip-link" href="#main-content">
        {nav('skip')}
      </a>
      <SiteHeader locale={locale} page="not-found" />
      <main id="main-content" tabIndex={-1} className={styles.error}>
        <div className={`page-container ${styles.intro}`}>
          <div>
            <p className="eyebrow">404</p>
            <h1 className={styles.title}>{t('title')}</h1>
            <p className={styles.description}>{t('description')}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={asset(`/${locale}/`)}>
                {t('home')} <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="button button-secondary" href={documentationUrl(locale)}>
                <BookOpen size={17} aria-hidden="true" /> {t('docs')}
              </a>
            </div>
          </div>
          <div className={styles.art}>
            <Cosmo variant="explore" className={styles.tracker} loading="eager" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function LocalizedNotFound({
  messages,
}: {
  messages: Record<Locale, AbstractIntlMessages>;
}) {
  const locale = useSyncExternalStore(subscribe, locationLocale, () => defaultLocale);
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
      <ErrorContent locale={locale} />
    </NextIntlClientProvider>
  );
}
