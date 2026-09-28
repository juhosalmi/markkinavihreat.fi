/**
 * Team member ↔ content links.
 *
 * Programs and blog posts refer to team members by slug (the team file's
 * `<slug>` in `<slug>.<locale>.md`): programs through `citations[].person` and
 * `contributors`, posts through `authors`. Zod can't check those slugs against
 * another collection, so assertTeamRefs() does it at build time instead.
 *
 * Kept free of `astro:content` imports so it can be unit-tested with plain
 * objects; callers pass in the collections.
 */
import { localePath, parseLocalizedId, type Locale } from './content'

interface ProgramLike {
  id: string
  data: {
    order: number
    unlisted: boolean
    citations: Array<{ person: string; quote: string }>
    contributors: string[]
  }
}

interface PostLike {
  id: string
  data: { date: Date; authors: string[] }
}

export function personPath(locale: Locale, slug: string): string {
  return localePath(locale, `/ketka/${slug}/`)
}

const META_DESCRIPTION_MAX = 160
const SENTENCE_MIN = 60

/**
 * The bio's opening sentence as plain text, which by convention is a
 * self-contained "X is Y" statement. Markdown links are reduced to their text.
 * Empty string for an empty bio. Used whole as the Person JSON-LD description.
 */
export function firstSentenceOfBio(bio: string): string {
  const plain = bio
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // A sentence end is a period after a whole word of 4+ letters, optionally
  // closing a parenthesis — "(DI, Aalto)." — but not "M.Sc.", "vt." or "ry.",
  // and far enough in that it isn't a stray early period.
  for (const match of plain.matchAll(/(?<=(?:^|[\s(-])\p{L}{4,}\)?)[.!?](?=\s|$)/gu)) {
    if (match.index + 1 >= SENTENCE_MIN) return plain.slice(0, match.index + 1)
  }
  return plain
}

/** A person page's meta description: the opening sentence, cut at a word boundary if long. */
export function metaDescriptionFromBio(bio: string, fallback: string): string {
  const sentence = firstSentenceOfBio(bio)
  if (!sentence) return fallback
  if (sentence.length <= META_DESCRIPTION_MAX) return sentence
  const cut = sentence.slice(0, META_DESCRIPTION_MAX - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/**
 * Throws if any program or post names a team slug that doesn't exist. Called
 * from the person pages' getStaticPaths, so a typo fails `astro build`.
 */
export function assertTeamRefs(
  teamIds: string[],
  programs: ProgramLike[],
  posts: PostLike[],
): void {
  const known = new Set(teamIds.map((id) => parseLocalizedId(id).slug))
  const problems: string[] = []

  for (const program of programs) {
    const refs = [...program.data.citations.map((c) => c.person), ...program.data.contributors]
    for (const slug of refs) {
      if (!known.has(slug)) problems.push(`programs/${program.id}: unknown team member "${slug}"`)
    }
  }
  for (const post of posts) {
    for (const slug of post.data.authors) {
      if (!known.has(slug)) problems.push(`blog/${post.id}: unknown team member "${slug}"`)
    }
  }

  if (problems.length > 0) {
    throw new Error(`Unknown team member slugs:\n  ${problems.join('\n  ')}`)
  }
}

export interface ProgramInvolvement<P extends ProgramLike> {
  program: P
  /** The person's endorsement quote in this program, if they're cited. */
  quote?: string
}

/**
 * What a person took part in, in one locale: listed programs where they're
 * cited or a contributor (by `order`), and posts they wrote (newest first).
 * Unlisted programs are left out — they're noindex and not meant to be
 * announced, so a person page shouldn't link to them either.
 */
export function involvementFor<P extends ProgramLike, B extends PostLike>(
  slug: string,
  locale: Locale,
  programs: P[],
  posts: B[],
): { programs: ProgramInvolvement<P>[]; posts: B[] } {
  const inLocale = <T extends { id: string }>(entry: T) =>
    parseLocalizedId(entry.id).locale === locale

  const personPrograms = programs
    .filter(inLocale)
    .filter((p) => !p.data.unlisted)
    .filter(
      (p) => p.data.contributors.includes(slug) || p.data.citations.some((c) => c.person === slug),
    )
    .sort((a, b) => a.data.order - b.data.order)
    .map((program) => ({
      program,
      quote: program.data.citations.find((c) => c.person === slug)?.quote,
    }))

  const personPosts = posts
    .filter(inLocale)
    .filter((p) => p.data.authors.includes(slug))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  return { programs: personPrograms, posts: personPosts }
}
