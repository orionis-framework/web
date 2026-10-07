import type { Metadata } from 'next';
import HomePage from '@/components/home-page';
import { routing } from '@/i18n/routing';
import { getPageMetadata } from '@/lib/site';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.find((supported) => supported === requestedLocale);

  if (!locale) notFound();

  return getPageMetadata(locale);
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.find((supported) => supported === requestedLocale);

  if (!locale) notFound();

  setRequestLocale(locale);
  return <HomePage locale={locale} />;
}
