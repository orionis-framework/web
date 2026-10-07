import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { defaultLocale } from '@/i18n/routing';
import { getPageMetadata } from '@/lib/site';
import './globals.css';

const titilliumWeb = localFont({
  src: [
    { path: './fonts/titillium-web-400-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/titillium-web-600-latin.woff2', weight: '600', style: 'normal' },
    { path: './fonts/titillium-web-700-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-titillium-web',
});

const jetBrainsMono = localFont({
  src: './fonts/jetbrains-mono-regular.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = getPageMetadata(defaultLocale);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={defaultLocale}
      className={`${titilliumWeb.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
