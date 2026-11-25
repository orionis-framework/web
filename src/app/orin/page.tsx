import { setRequestLocale } from 'next-intl/server';
import { OrinPage, orinMetadata } from '@/components/orin-page';
import { defaultLocale } from '@/i18n/routing';

export function generateMetadata() {
  return orinMetadata(defaultLocale);
}

export default function Page() {
  setRequestLocale(defaultLocale);
  return <OrinPage locale={defaultLocale} />;
}
