'use client';

import { Download, Expand, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { artworks, artworkUrl, collectionUrl, type Artwork } from './cosmo-artwork';
import styles from './cosmo-page.module.css';

const filters = [
  ['all', 'filterAll'],
  ['solo', 'filterSolo'],
  ['together', 'filterTogether'],
] as const;

export function CosmoGallery() {
  const t = useTranslations('Cosmo');
  const [filter, setFilter] = useState<(typeof filters)[number][0]>('all');
  const [active, setActive] = useState<Artwork>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (active) dialogRef.current?.showModal();
  }, [active]);

  function preview(event: MouseEvent<HTMLAnchorElement>, artwork: Artwork) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !dialogRef.current?.showModal
    )
      return;
    event.preventDefault();
    setActive(artwork);
  }

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className={`page-container ${styles.collection}`}
    >
      <div className={styles.galleryHeading}>
        <div>
          <p className={styles.sectionLabel}>{t('galleryEyebrow')}</p>
          <h2 id="gallery-title">{t('galleryTitle')}</h2>
          <p className={styles.lede}>{t('galleryIntro')}</p>
        </div>
        <a
          href={collectionUrl}
          download="cosmo-gallery.zip"
          className={`button button-secondary ${styles.pack}`}
        >
          <Download size={17} aria-hidden="true" /> {t('downloadAll')}
        </a>
      </div>
      <div className={styles.filters} role="group" aria-label={t('filterLabel')}>
        {filters.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {t(label)}{' '}
            <span>{artworks.filter((item) => value === 'all' || item.group === value).length}</span>
          </button>
        ))}
      </div>
      <ul className={styles.grid}>
        {artworks
          .filter((item) => filter === 'all' || item.group === filter)
          .map((art: Artwork) => {
            const title = t(`galleryItems.${art.id}.title`);
            const src = artworkUrl(art);
            return (
              <li
                key={art.id}
                className={styles.tile}
                data-panorama={art.id === 'night-sky' || undefined}
              >
                <a
                  className={styles.cover}
                  data-scene={art.scene}
                  data-tone={art.tone}
                  href={src}
                  onClick={(event) => preview(event, art)}
                  aria-label={`${t('preview')} · ${title}`}
                >
                  <Image
                    src={src}
                    width={art.width}
                    height={art.height}
                    unoptimized
                    loading="lazy"
                    className={styles.cardImage}
                    alt={t(`galleryItems.${art.id}.alt`)}
                  />
                  <span className={styles.expand}>
                    <Expand size={16} aria-hidden="true" />
                  </span>
                </a>
                <div className={styles.caption}>
                  <div>
                    <h3>{title}</h3>
                    <p>
                      WebP · {art.width} × {art.height}
                    </p>
                  </div>
                  <a
                    className={styles.download}
                    href={src}
                    download={`cosmo-${art.id}.webp`}
                    aria-label={`${t('download')} · ${title}`}
                    title={`${t('download')} · ${title}`}
                  >
                    <Download size={17} aria-hidden="true" />
                    <span>{t('download')}</span>
                  </a>
                </div>
              </li>
            );
          })}
      </ul>
      <dialog
        ref={dialogRef}
        className={styles.viewer}
        aria-labelledby="preview-title"
        onClose={() => setActive(undefined)}
      >
        {active && (
          <div className={styles.viewerInner}>
            <div className={styles.viewerHeader}>
              <h2 id="preview-title">{t(`galleryItems.${active.id}.title`)}</h2>
              <form method="dialog">
                <button className={styles.close} aria-label={t('closePreview')}>
                  <X size={22} />
                </button>
              </form>
            </div>
            <div className={styles.viewerStage} data-tone={active.tone} data-scene={active.scene}>
              <Image
                src={artworkUrl(active)}
                width={active.width}
                height={active.height}
                unoptimized
                alt={t(`galleryItems.${active.id}.alt`)}
              />
            </div>
            <div className={styles.viewerFooter}>
              <span>
                WebP · {active.width} × {active.height}
              </span>
              <a
                className="button button-primary"
                href={artworkUrl(active)}
                download={`cosmo-${active.id}.webp`}
              >
                <Download size={17} aria-hidden="true" />
                {t('download')}
              </a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
