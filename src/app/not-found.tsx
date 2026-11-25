import { LocalizedNotFound } from '@/components/localized-not-found';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';

export const metadata = {
  title: '404 | Orionis Framework',
  description: null,
  robots: { index: false, follow: true },
  alternates: null,
  openGraph: null,
  twitter: null,
};

function errorMessages({ NotFound, Orin, Home }: typeof en) {
  return {
    NotFound,
    Orin: { alt: Orin.alt },
    Home: { nav: Home.nav, theme: Home.theme, hero: { githubCta: Home.hero.githubCta } },
  };
}

export default function NotFound() {
  // GitHub Pages serves the same static 404.html for every missing URL.
  return <LocalizedNotFound messages={{ en: errorMessages(en), es: errorMessages(es) }} />;
}
