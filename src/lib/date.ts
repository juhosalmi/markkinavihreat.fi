import type { Locale } from './content'

const INTL_LOCALE: Record<Locale, string> = { fi: 'fi-FI', sv: 'sv-FI', en: 'en-GB' }

/** URL date segment, e.g. "2026-07-05". */
export function dateSlug(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(date)
}
