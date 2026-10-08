'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronDown, Languages, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { PreviewNotice } from './project-stats';
import { ThemeToggle } from './theme-toggle';
import type { Locale } from '@/i18n/routing';
import { asset } from '@/lib/asset';
import { nav, site } from '@/lib/site';

export function SiteHeader({ locale }: { locale: Locale }) {
  const translate = useTranslations('Home');
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const frameworkButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const alternateLocale = locale === 'en' ? 'es' : 'en';
  const docsUrl = site.docs.replace('/en/', `/${locale}/`);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setFrameworkOpen(false);
        setMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || (!frameworkOpen && !menuOpen)) return;
      event.preventDefault();
      setFrameworkOpen(false);
      setMenuOpen(false);
      (frameworkOpen ? frameworkButtonRef : mobileButtonRef).current?.focus();
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [frameworkOpen, menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 980px)');
    const closeMobileMenu = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeMobileMenu);
    return () => desktop.removeEventListener('change', closeMobileMenu);
  }, []);

  const menuDescriptions: Record<string, string> = {
    features: translate('nav.menuFeatures'),
    architecture: translate('nav.menuArchitecture'),
    examples: translate('nav.menuExamples'),
    ecosystem: translate('nav.menuEcosystem'),
  };

  return (
    <header ref={headerRef} className="site-header">
      <PreviewNotice message={translate('previewNotice')} />
      <div className="header-inner">
        <a href={asset(`/${locale}/`)} className="brand" aria-label={site.fullName}>
          <Image src={asset('/favicon.svg')} alt="" width={43} height={43} priority />
          <span className="brand-copy">
            <strong>ORIONIS</strong>
            <span>FRAMEWORK</span>
          </span>
        </a>

        <nav className="desktop-nav" aria-label={translate('nav.ariaLabel')}>
          <button
            ref={frameworkButtonRef}
            type="button"
            className="nav-disclosure"
            aria-expanded={frameworkOpen}
            aria-controls="framework-menu"
            onClick={() => setFrameworkOpen(!frameworkOpen)}
          >
            {translate('nav.features')}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {nav.slice(1).map((item) => (
            <a key={item.key} href={item.href}>
              {translate(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a
            className="icon-button header-github"
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            aria-label={translate('hero.githubCta')}
            title={translate('hero.githubCta')}
          >
            <SiGithub size={19} color="currentColor" aria-hidden="true" />
          </a>
          <ThemeToggle
            switchToLightLabel={translate('theme.switchToLight')}
            switchToDarkLabel={translate('theme.switchToDark')}
          />
          <a
            href={asset(`/${alternateLocale}/`)}
            hrefLang={alternateLocale}
            className="locale-switch"
            aria-label={translate('nav.switchLocale')}
            title={translate('nav.switchLocale')}
          >
            <Languages size={16} aria-hidden="true" />
            <span>{alternateLocale.toUpperCase()}</span>
          </a>
          <a
            href={docsUrl}
            className="button button-small header-docs"
            aria-label={translate('nav.docs')}
            title={translate('nav.docs')}
          >
            <BookOpen size={16} aria-hidden="true" />
            <span>{translate('nav.docs')}</span>
            <ArrowUpRight size={14} className="header-docs-arrow" aria-hidden="true" />
          </a>
          <button
            ref={mobileButtonRef}
            type="button"
            className="icon-button mobile-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? translate('nav.closeMenu') : translate('nav.openMenu')}
            title={menuOpen ? translate('nav.closeMenu') : translate('nav.openMenu')}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {frameworkOpen && (
        <div id="framework-menu" className="framework-menu">
          {nav.map((item) => (
            <a key={item.key} href={item.href} onClick={() => setFrameworkOpen(false)}>
              <span>
                <strong>
                  {translate(item.key === 'features' ? 'nav.capabilities' : `nav.${item.key}`)}
                </strong>
                <span>{menuDescriptions[item.key]}</span>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          ))}
        </div>
      )}

      <nav
        id="mobile-navigation"
        className="mobile-navigation"
        hidden={!menuOpen}
        aria-label={translate('nav.ariaLabel')}
      >
        {nav.map((item) => (
          <a key={item.key} href={item.href} onClick={() => setMenuOpen(false)}>
            <span>
              {translate(item.key === 'features' ? 'nav.capabilities' : `nav.${item.key}`)}
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        ))}
        <a href={site.repo} target="_blank" rel="noreferrer">
          <span>GitHub</span>
          <SiGithub size={18} color="currentColor" aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
