// Parliamentary electoral districts a candidate can run in. Team entries store
// the language-neutral key (`district`), so the about page can group and
// filter candidates the same way in every locale. Add a district here when the
// first candidate from it joins; names match the ones in `candidateBadge`.
import type { Locale } from './content'

export const DISTRICTS = [
  'helsinki',
  'uusimaa',
  'varsinais-suomi',
  'kaakkois-suomi',
  'savo-karjala',
  'oulu',
] as const

export type District = (typeof DISTRICTS)[number]

export const districtNames: Record<Locale, Record<District, string>> = {
  fi: {
    helsinki: 'Helsinki',
    uusimaa: 'Uusimaa',
    'varsinais-suomi': 'Varsinais-Suomi',
    'kaakkois-suomi': 'Kaakkois-Suomi',
    'savo-karjala': 'Savo-Karjala',
    oulu: 'Oulu',
  },
  sv: {
    helsinki: 'Helsingfors',
    uusimaa: 'Nyland',
    'varsinais-suomi': 'Egentliga Finland',
    'kaakkois-suomi': 'Sydöstra Finland',
    'savo-karjala': 'Savolax–Karelen',
    oulu: 'Uleåborg',
  },
  en: {
    helsinki: 'Helsinki',
    uusimaa: 'Uusimaa',
    'varsinais-suomi': 'Southwest Finland',
    'kaakkois-suomi': 'Southeast Finland',
    'savo-karjala': 'Savo-Karelia',
    oulu: 'Oulu',
  },
}
