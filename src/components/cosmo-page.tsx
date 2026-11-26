import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Cosmo } from './cosmo';
import styles from './cosmo-page.module.css';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import type { Locale } from '@/i18n/routing';
import { documentationUrl, getPageMetadata, site } from '@/lib/site';

export async function cosmoMetadata(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'Cosmo' });
  return getPageMetadata(locale, {
    title: `${t('title')} | ${site.fullName}`,
    description: t('intro'),
    path: 'cosmo/',
  });
}

export async function CosmoPage({ locale }: { locale: Locale }) {
  const [messages, t, nav] = await Promise.all([
    getMessages({ locale }),
    getTranslations({ locale, namespace: 'Cosmo' }),
    getTranslations({ locale, namespace: 'Home.nav' }),
  ]);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale} className="site-shell">
        <a className="skip-link" href="#main-content">
          {nav('skip')}
        </a>
        <SiteHeader locale={locale} page="cosmo" />
        <main id="main-content" tabIndex={-1}>
          <section className={styles.banner} aria-labelledby="cosmo-title">
            <div className={`page-container ${styles.intro}`}>
              <div>
                <h1 id="cosmo-title" className={styles.title}>
                  {t('title')}
                </h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>
                <p className={styles.description}>{t('intro')}</p>
                <div className="hero-actions">
                  <a className="button button-primary" href={documentationUrl(locale)}>
                    {t('documentation')} <ArrowRight size={17} aria-hidden="true" />
                  </a>
                  <a
                    className="button button-secondary"
                    href={documentationUrl(locale, 'contribute/guide')}
                  >
                    {t('community')} <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className={styles.art}>
                <Cosmo variant="star" loading="eager" className={styles.portrait} />
              </div>
            </div>
          </section>
          <section className={`page-container ${styles.gallery}`} aria-labelledby="cosmo-poses">
            <h2 id="cosmo-poses">{t('gallery')}</h2>
            <div className={styles.poses}>
              {(['wave', 'explore'] as const).map((pose) => (
                <figure key={pose}>
                  <Cosmo variant={pose} className={styles.study} decorative />
                  <figcaption>{t(`${pose}Caption`)}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
