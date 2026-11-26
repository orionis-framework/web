import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CosmoPage, cosmoMetadata } from '@/components/cosmo-page';
import { locales } from '@/i18n/routing';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

async function supportedLocale(params: Props['params']) {
  const { locale: requested } = await params;
  const locale = locales.find((value) => value === requested);
  if (!locale) notFound();
  return locale;
}

export async function generateMetadata({ params }: Props) {
  return cosmoMetadata(await supportedLocale(params));
}

export default async function Page({ params }: Props) {
  const locale = await supportedLocale(params);
  setRequestLocale(locale);
  return <CosmoPage locale={locale} />;
}
