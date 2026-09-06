/**
 * RSS 2.0 feed for the Finnish edition.
 *
 * Hand-rolled rather than via @astrojs/rss: the dependency would buy ~30 lines
 * of string building, and AGENTS.md asks before adding one. Feeds are how
 * aggregators and AI crawlers pick up new writing, which matters more here than
 * for a site that already ranks.
 *
 * Finnish only for now — it's the default, unprefixed locale. Per-locale feeds
 * are a small addition if the sv/en editions ever get their own audience.
 */
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { parseLocalizedId, forLocale } from '../lib/content'
import { SITE_URL } from '../lib/structuredData'

const LOCALE = 'fi' as const
const TITLE = 'Markkinavihreät'
const DESCRIPTION =
  'Markkinavihreiden ehdotukset ja kirjoitukset — markkinaliberaali verkosto Vihreissä.'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface FeedItem {
  title: string
  description: string
  url: string
  date: Date
}

export const GET: APIRoute = async () => {
  const programs = forLocale(await getCollection('programs'), LOCALE)
    .filter((program) => !program.data.unlisted)
    .map((program) => ({
      title: program.data.title,
      description: program.data.description,
      url: `${SITE_URL}/ehdotukset/${parseLocalizedId(program.id).slug}/`,
      date: program.data.updated ?? program.data.published,
    }))

  // The blog collection is empty today (the sole post was removed in 4f9c4bc),
  // but posts flow into the feed automatically once it isn't.
  const posts = forLocale(await getCollection('blog'), LOCALE).map((post) => {
    const slug = parseLocalizedId(post.id).slug
    const date = post.data.date
    const day = date.toISOString().slice(0, 10)
    return {
      title: post.data.title,
      description: post.data.description,
      url: `${SITE_URL}/blogi/${day}/${slug}/`,
      date,
    }
  })

  const items: FeedItem[] = [...programs, ...posts].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  )

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>fi</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
