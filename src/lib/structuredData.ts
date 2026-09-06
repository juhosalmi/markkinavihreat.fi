/**
 * schema.org JSON-LD builders.
 *
 * Every page emits a single `@graph` whose first node is the Organization,
 * carrying a stable `@id` that the page-specific nodes reference instead of
 * redefining. That's what teaches search engines "Markkinavihreät" is one
 * entity across the site — the main goal here, since the network currently
 * doesn't even win searches for its own name.
 *
 * Ground rule for this file: markup may only describe what the visible page
 * actually says. Nothing is asserted here that a reader can't see on the page.
 */
import type { Locale } from './content'

export const SITE_URL = 'https://markkinavihreat.fi'
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export type JsonLdNode = Record<string, unknown>

const ORG_NAME = 'Markkinavihreät'

/** The organization itself. Emitted on every page so the entity is unambiguous. */
export function organizationNode(description: string): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: ORG_NAME,
    url: `${SITE_URL}/`,
    description,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/apple-touch-icon.png`,
      width: 180,
      height: 180,
    },
    // The network's other web property. Declaring it here is the counterpart to
    // vaihdavihreisiin.fi pointing its Organization back at this domain.
    sameAs: ['https://vaihdavihreisiin.fi/'],
  }
}

/**
 * The site as a whole — home page only.
 *
 * `about` names Vihreä liitto because the visible home copy is explicitly about
 * the network's position within the party. Note this is deliberately *not*
 * `memberOf`: Markkinavihreät is an informal network, not a constituent
 * organization of the party, and the markup shouldn't claim more structure
 * than exists.
 */
export function webSiteNode(locale: Locale, description: string): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: ORG_NAME,
    url: `${SITE_URL}/`,
    description,
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
    about: {
      '@type': 'PoliticalParty',
      name: 'Vihreä liitto',
      url: 'https://www.vihreat.fi',
    },
  }
}

interface ArticleInput {
  url: string
  headline: string
  description: string
  locale: Locale
  image: string
  published: Date
  updated?: Date
}

export function articleNode({
  url,
  headline,
  description,
  locale,
  image,
  published,
  updated,
}: ArticleInput): JsonLdNode {
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    headline,
    description,
    inLanguage: locale,
    image,
    datePublished: published.toISOString(),
    dateModified: (updated ?? published).toISOString(),
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
  }
}

export function breadcrumbNode(trail: Array<{ name: string; url: string }>): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

// An answer that is *entirely* one emphasis span is the authoring convention
// for "still to be written" — e.g. `_Vastausta täydennetään._`. Matched by
// shape rather than by wording so it holds in all three locales, the same way
// programSections.ts matches its heading labels.
const WHOLLY_EMPHASISED = /^(\*{1,2}|_{1,2})(?:(?!\1)[\s\S])+\1$/

/** An answer is real unless it's blank or one of those pending-note placeholders. */
function isAnswered(answer: string): boolean {
  const trimmed = answer.trim()
  if (trimmed.replace(/[_*\s]/g, '').length === 0) return false
  return !WHOLLY_EMPHASISED.test(trimmed)
}

/**
 * FAQPage markup for a program's FAQ section — or null.
 *
 * Returns null unless the page is indexable *and* every question has a real
 * answer. Marking up placeholder answers would be spam, and a partial FAQPage
 * misrepresents the page. Today no program clears this bar: the only one with
 * an FAQ is `unlisted` and mostly unanswered, so this is expected to emit
 * nothing until that content is finished.
 */
export function faqNode(
  items: Array<{ question: string; answer: string }>,
  { indexable }: { indexable: boolean },
): JsonLdNode | null {
  if (!indexable || items.length === 0) return null
  if (!items.every((item) => isAnswered(item.answer))) return null

  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** Wraps page nodes into the single `@graph` document a page emits. */
export function buildGraph(nodes: JsonLdNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
}
