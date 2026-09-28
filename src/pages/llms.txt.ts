/**
 * llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI
 * answer engines, which robots.txt already welcomes. Mirrors the sibling
 * lavanti.fi's: one summary line, the key pages, then every program, post and
 * person with a one-line description.
 *
 * Finnish only, like rss.xml — it's the default locale, and each listed page
 * carries hreflang links to its sv/en editions. Copy is reused from what the
 * pages themselves say; nothing here is written for bots alone.
 */
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { forLocale, parseLocalizedId } from '../lib/content'
import { dateSlug } from '../lib/date'
import { metaDescriptionFromBio } from '../lib/team'
import { SITE_URL } from '../lib/structuredData'
import { home } from '../i18n/pages'
import { t } from '../i18n/ui'

const LOCALE = 'fi' as const

const line = (title: string, path: string, description?: string) =>
  `- [${title}](${SITE_URL}${path})${description ? `: ${description}` : ''}`

export const GET: APIRoute = async () => {
  const pillars = [
    line(t(LOCALE, 'nav.home'), '/'),
    line(t(LOCALE, 'nav.manifesto'), '/manifesti/'),
    line(t(LOCALE, 'nav.programs'), '/ehdotukset/'),
    line(t(LOCALE, 'nav.blog'), '/blogi/'),
    line(t(LOCALE, 'nav.about'), '/ketka/'),
    line(t(LOCALE, 'nav.contact'), '/yhteystiedot/'),
  ]

  const programs = forLocale(await getCollection('programs'), LOCALE)
    .filter((program) => !program.data.unlisted)
    .sort((a, b) => a.data.order - b.data.order)
    .map((program) =>
      line(
        program.data.title,
        `/ehdotukset/${parseLocalizedId(program.id).slug}/`,
        program.data.description,
      ),
    )

  const posts = forLocale(await getCollection('blog'), LOCALE)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((post) =>
      line(
        post.data.title,
        `/blogi/${dateSlug(post.data.date)}/${parseLocalizedId(post.id).slug}/`,
        post.data.description,
      ),
    )

  const people = forLocale(await getCollection('team'), LOCALE)
    .sort((a, b) => a.data.name.localeCompare(b.data.name, 'fi'))
    .map((person) =>
      line(
        person.data.name,
        `/ketka/${parseLocalizedId(person.id).slug}/`,
        metaDescriptionFromBio(person.body ?? '', ''),
      ),
    )

  const sections: Array<[string, string[]]> = [
    ['Tärkeimmät sivut', pillars],
    [t(LOCALE, 'nav.programs'), programs],
    [t(LOCALE, 'nav.blog'), posts],
    [t(LOCALE, 'nav.about'), people],
    [
      'Muut kielet / Andra språk / Other languages',
      [line('Svenska', '/sv/'), line('English', '/en/')],
    ],
  ]

  const body = `# Markkinavihreät

> ${home[LOCALE].metaDescription}

${sections
  .filter(([, lines]) => lines.length > 0)
  .map(([heading, lines]) => `## ${heading}\n\n${lines.join('\n')}`)
  .join('\n\n')}
`

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
