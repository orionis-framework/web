import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * GitHub Pages serves project sites from a sub-path
 * (e.g. https://<user>.github.io/web-orionis/).
 * The deploy workflow sets NEXT_PUBLIC_BASE_PATH accordingly.
 * When a custom domain is used, keep it empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default withNextIntl(nextConfig);
