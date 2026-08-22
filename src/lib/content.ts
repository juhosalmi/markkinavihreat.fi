export type Locale = 'fi' | 'sv' | 'en'

export const LOCALES: Locale[] = ['fi', 'sv', 'en']
export const DEFAULT_LOCALE: Locale = 'fi'

interface HasId {
  id: string
}

/**
 * Content entry ids are `<slug>.<locale>` (from the `<slug>.<locale>.md`
 * filename convention, see src/content.config.ts). Splits that back apart.
 */
export function parseLocalizedId(id: string): { slug: string; locale: Locale } {
  const lastDot = id.lastIndexOf('.')
  const slug = id.slice(0, lastDot)
  const locale = id.slice(lastDot + 1) as Locale
  return { slug, locale }
}

export function forLocale<T extends HasId>(entries: T[], locale: Locale): T[] {
  return entries.filter((entry) => parseLocalizedId(entry.id).locale === locale)
}

// BASE_URL is "/" in production and on the Cloudflare deploy; only a
// subpath preview (e.g. GitHub Pages, see astro.config.mjs) sets it to
// something else, so this is a no-op outside that case.
function withBase(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${normalized}`
}

export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const localized = locale === DEFAULT_LOCALE ? normalized : `/${locale}${normalized}`
  return withBase(localized)
}

/**
 * Prefixes a root-absolute static asset path (e.g. a content collection's
 * `/images/team/...` field) the same way localePath() prefixes routes.
 */
export function assetPath(path: string): string {
  return withBase(path)
}

/**
 * Value for the `locale` rest param in `src/pages/[[...locale]]/**` routes:
 * undefined for the default locale (produces no URL segment), otherwise the
 * locale code itself.
 */
export function localeParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale
}

export function localeFromParam(param: string | undefined): Locale {
  return (param as Locale | undefined) ?? DEFAULT_LOCALE
}
