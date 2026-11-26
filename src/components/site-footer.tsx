import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowRight, ArrowUpRight, Terminal } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { CopyCodeButton } from './copy-code-button';
import { Cosmo } from './cosmo';
import { ProjectStats } from './project-stats';
import type { Locale } from '@/i18n/routing';
import { asset } from '@/lib/asset';
import { loadProjectStats } from '@/lib/project-stats';
import { documentationUrl, inspectorUrl, site } from '@/lib/site';
import styles from './home-cosmo.module.css';

interface SiteFooterProps {
  locale: Locale;
  showGettingStarted?: boolean;
}

export async function SiteFooter({ locale, showGettingStarted = false }: SiteFooterProps) {
  const [translate, stats] = await Promise.all([
    getTranslations({ locale, namespace: 'Home' }),
    loadProjectStats({ cache: 'default' }),
  ]);
  const docsUrl = documentationUrl(locale);
  const cosmoUrl = asset(`/${locale}/cosmo/`);
  const installCommand = site.installCommand;
  const footerGroups: {
    label: string;
    links: { label: string; href: string; internal?: boolean }[];
  }[] = [
    {
      label: translate('footer.learn'),
      links: [
        { label: translate('nav.docs'), href: docsUrl },
        { label: translate('footer.api'), href: site.apiReference },
        { label: translate('nav.inspector'), href: inspectorUrl(locale) },
        {
          label: translate('footer.installation'),
          href: documentationUrl(locale, 'getting-started/installation'),
        },
      ],
    },
    {
      label: translate('footer.project'),
      links: [
        { label: 'GitHub', href: site.repo },
        { label: 'PyPI', href: site.pypi },
        { label: translate('footer.releases'), href: `${site.repo}/releases` },
        {
          label: translate('footer.thirdPartyNotices'),
          href: asset(site.granian.license),
        },
      ],
    },
    {
      label: translate('footer.community'),
      links: [
        { label: translate('footer.cosmo'), href: cosmoUrl, internal: true },
        {
          label: translate('footer.contribute'),
          href: documentationUrl(locale, 'contribute/guide'),
        },
        { label: translate('footer.issues'), href: `${site.repo}/issues` },
        {
          label: translate('footer.contributors'),
          href: documentationUrl(locale, 'contribute/contributors'),
        },
      ],
    },
  ];

  return (
    <footer id="community" className="site-footer">
      <div className="page-container">
        {showGettingStarted && (
          <section id="getting-started" className="footer-cta" aria-labelledby="start-title">
            <div>
              <p className="eyebrow">{translate('start.eyebrow')}</p>
              <h2 id="start-title">
                {translate('start.titleFirst')}
                <br />
                <span>{translate('start.titleSecond')}</span>
              </h2>
              <p>{translate('start.description')}</p>
              <div className="hero-actions">
                <a href={docsUrl} className="button button-primary">
                  {translate('hero.docsCta')}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a
                  href={site.repo}
                  className="button button-footer"
                  target="_blank"
                  rel="noreferrer"
                >
                  <SiGithub size={17} color="currentColor" aria-hidden="true" />
                  GitHub
                </a>
              </div>
              <p className={styles.introduction}>
                {translate.rich('start.cosmo', {
                  link: (chunks) => <a href={cosmoUrl}>{chunks}</a>,
                })}
              </p>
            </div>
            <div className={styles.installArea}>
              <Cosmo variant="star" className={styles.star} decorative />
              <div className="install-command">
                <Terminal size={19} aria-hidden="true" />
                <code>{installCommand}</code>
                <CopyCodeButton
                  code={installCommand}
                  label={translate('examples.copyCommand')}
                  copiedLabel={translate('examples.copied')}
                />
              </div>
            </div>
          </section>
        )}
        <div className="footer-main">
          <div className="footer-brand">
            <a href={asset(`/${locale}/`)}>
              <Image src={asset('/favicon.svg')} alt="" width={44} height={44} />
              <strong>Orionis Framework</strong>
            </a>
            <p>{translate('footer.description')}</p>
            <ProjectStats
              initialStats={stats}
              locale={locale}
              starsLabel={translate('footer.stars')}
              versionLabel={translate('footer.version')}
              unavailableLabel={translate('footer.unavailable')}
            />
          </div>
          <div className="footer-links">
            {footerGroups.map((group) => (
              <div key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target={link.internal ? undefined : '_blank'}
                        rel={link.internal ? undefined : 'noreferrer'}
                      >
                        {link.label}
                        {link.internal ? (
                          <ArrowRight size={13} aria-hidden="true" />
                        ) : (
                          <ArrowUpRight size={13} aria-hidden="true" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          ORIONIS<span>.</span>
        </div>
        <div className="footer-bottom">
          <p>
            {translate('footer.copyright', {
              year: new Date().getFullYear(),
              name: site.author,
            })}
          </p>
          <span>
            <span className="status-mark" aria-hidden="true" />
            {translate('footer.madeFor')}
          </span>
        </div>
      </div>
    </footer>
  );
}
