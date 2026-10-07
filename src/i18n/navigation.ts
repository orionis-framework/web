import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale aware navigation helpers.
 * Every internal link is automatically prefixed with the active locale,
 * which keeps the static export predictable on GitHub Pages.
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation({
    locales: routing.locales,
    localePrefix: 'always',
  });
