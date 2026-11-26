import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Cosmo } from './cosmo';
import { panoramaUrl } from './cosmo-artwork';
import { CosmoGallery } from './cosmo-gallery';
import styles from './cosmo-page.module.css';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import type { Locale } from '@/i18n/routing';
import { documentationUrl, getPageMetadata, site } from '@/lib/site';

export async function cosmoMetadata(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'Cosmo' });
  const meta = getPageMetadata(locale, {
    title: `${t('title')} | ${site.fullName}`,
    description: `${t('intro')} ${t('galleryIntro')}`,
    path: 'cosmo/',
  });
  const image = {
    url: new URL(panoramaUrl, site.url).href,
    width: 2137,
    height: 736,
    alt: t('galleryItems.night-sky.alt'),
  };
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [image] },
    twitter: { ...meta.twitter, images: [image] },
  };
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
          <section className={styles.hero} aria-labelledby="cosmo-title">
            <Image
              className={styles.sky}
              src={panoramaUrl}
              width={2137}
              height={736}
              alt={t('galleryItems.night-sky.alt')}
              loading="eager"
              fetchPriority="high"
              unoptimized
            />
            <div className={`page-container ${styles.heroInner}`}>
              <div className={styles.heroCopy}>
                <p className={styles.heroLabel}>
                  <Sparkles size={17} aria-hidden="true" />
                  {t('eyebrow')}
                </p>
                <h1 id="cosmo-title">Cosmo</h1>
                <p className={styles.heroSub}>{t('subtitle')}</p>
                <p className={styles.heroText}>{t('intro')}</p>
                <a className={`button button-primary ${styles.exploreButton}`} href="#gallery">
                  {t('jumpGallery')} <ArrowDown size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
          <CosmoGallery />
          <section className={styles.story} aria-labelledby="story-title">
            <div className={`page-container ${styles.storyInner}`}>
              <div className={styles.storyArt}>
                <Cosmo variant="explore" decorative />
              </div>
              <div className={styles.storyCopy}>
                <p className={styles.sectionLabel}>{t('storyEyebrow')}</p>
                <h2 id="story-title">{t('storyTitle')}</h2>
                {t('storyBody')
                  .split('\n\n')
                  .map((paragraph) => (
                    <p className={styles.lede} key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                <div className={styles.storyLinks}>
                  <a href={documentationUrl(locale)}>
                    {t('documentation')} <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a href={documentationUrl(locale, 'contribute/guide')}>
                    {t('community')} <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>
          <section className={`page-container ${styles.design}`} aria-labelledby="design-title">
            <div>
              <p className={styles.sectionLabel}>{t('designEyebrow')}</p>
              <h2 id="design-title">{t('designTitle')}</h2>
              <p className={styles.lede}>{t('designIntro')}</p>
            </div>
            <dl className={styles.traits}>
              {(['ear', 'chest', 'paw'] as const).map((part) => (
                <div className={styles.trait} key={part}>
                  <dt>
                    <span className={styles.detail} data-part={part}>
                      <Cosmo variant="star" decorative />
                    </span>
                    {t(`${part}Title`)}
                  </dt>
                  <dd>{t(`${part}Body`)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </main>
        <SiteFooter locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
