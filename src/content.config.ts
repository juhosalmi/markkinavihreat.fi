import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

const locale = z.enum(['fi', 'sv', 'en'])

// Filenames encode the locale so translations of the same entry share a base
// slug: `<slug>.<locale>.md`. The translation-parity check (scripts/validate-translations.ts)
// relies on this convention to verify every locale exists for every entry.
const socialLink = z.object({
  type: z.enum([
    'website',
    'mastodon',
    'bluesky',
    'threads',
    'linkedin',
    'instagram',
    'facebook',
    'tiktok',
    'x',
    'youtube',
    'reddit',
  ]),
  url: z.url(),
  label: z.string().optional(),
})

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    locale,
    name: z.string(),
    order: z.number(),
    photo: z.string(),
    candidateBadge: z.string().optional(),
    links: z
      .array(socialLink)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
  }),
})

const programs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/programs' }),
  schema: z.object({
    locale,
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    locale,
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().optional(),
  }),
})

const manifesto = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/manifesto' }),
  schema: z.object({
    locale,
    title: z.string(),
  }),
})

export const collections = { team, programs, blog, manifesto }
