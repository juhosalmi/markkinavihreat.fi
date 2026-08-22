import type { Locale } from '../lib/content'

export const ui = {
  fi: {
    'nav.home': 'Etusivu',
    'nav.about': 'Ketkä',
    'nav.manifesto': 'Manifesti',
    'nav.programs': 'Ehdotukset',
    'nav.blog': 'Blogi',
    'nav.contact': 'Yhteystiedot',
    'nav.whatsapp': 'Liity WhatsApp-ryhmään',
    'nav.lang': 'Kieli',
    'footer.license': 'Sisältö julkaistu lisenssillä',
    'footer.disclaimer': 'Markkinavihreät ei ole Vihreä liiton virallinen sivusto.',
    'blog.readMore': 'Lue lisää',
    'blog.empty': 'Blogikirjoituksia ei vielä ole julkaistu.',
    'programs.empty': 'Ehdotuksia ei vielä ole julkaistu.',
    'programs.joinCta': 'Vaihda aitoon markkinapuolueeseen',
    'contact.whatsappCta': 'Liity markkinavihreiden avoimeen WhatsApp-ryhmään',
    'contact.joinCta': 'Liity Vihreisiin',
    'contact.mediaHeading': 'Yhteystiedot medialle',
  },
  sv: {
    'nav.home': 'Hem',
    'nav.about': 'Vilka vi är',
    'nav.manifesto': 'Manifest',
    'nav.programs': 'Förslag',
    'nav.blog': 'Blogg',
    'nav.contact': 'Kontakt',
    'nav.whatsapp': 'Gå med i WhatsApp-gruppen',
    'nav.lang': 'Språk',
    'footer.license': 'Innehållet publiceras under licensen',
    'footer.disclaimer': 'Markkinavihreät är inte De Grönas officiella webbplats.',
    'blog.readMore': 'Läs mer',
    'blog.empty': 'Inga blogginlägg har publicerats än.',
    'programs.empty': 'Inga förslag har publicerats än.',
    'programs.joinCta': 'Byt till ett äkta marknadsparti',
    'contact.whatsappCta': 'Gå med i marknadsgrönas öppna WhatsApp-grupp',
    'contact.joinCta': 'Gå med i De Gröna',
    'contact.mediaHeading': 'Kontaktuppgifter för media',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'Who we are',
    'nav.manifesto': 'Manifesto',
    'nav.programs': 'Suggestions',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.whatsapp': 'Join the WhatsApp group',
    'nav.lang': 'Language',
    'footer.license': 'Content published under the',
    'footer.disclaimer': 'Markkinavihreät is not an official site of the Green League.',
    'blog.readMore': 'Read more',
    'blog.empty': 'No blog posts have been published yet.',
    'programs.empty': 'No suggestions have been published yet.',
    'programs.joinCta': 'Switch to a genuine market party',
    'contact.whatsappCta': "Join the market greens' open WhatsApp group",
    'contact.joinCta': 'Join the Greens',
    'contact.mediaHeading': 'Media contact',
  },
} as const

export type UiKey = keyof (typeof ui)['fi']

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key] ?? ui.fi[key]
}
