import { setRequestLocale } from 'next-intl/server';
import { CosmoPage, cosmoMetadata } from '@/components/cosmo-page';
import { defaultLocale } from '@/i18n/routing';

export function generateMetadata() {
  return cosmoMetadata(defaultLocale);
}

export default function Page() {
  setRequestLocale(defaultLocale);
  return <CosmoPage locale={defaultLocale} />;
}
