import HomePage from '@/components/home-page';
import { defaultLocale } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export default function Page() {
  setRequestLocale(defaultLocale);
  return <HomePage locale={defaultLocale} />;
}