// @ts-check
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// Set by the GitHub Pages preview workflow to serve from a repo subpath
// (e.g. "/markkinavihreat.fi"); unset everywhere else, including the
// Cloudflare production deploy, which serves from "/".
const base = process.env.BASE_PATH || '/'

// Content collections aren't queryable here (this runs before Astro's content
// layer syncs), so `unlisted: true` programs are found by reading their
// frontmatter directly — kept out of the sitemap the same way
// ProgramsIndexBody keeps them off the /ehdotukset/ listing.
function unlistedProgramSlugs() {
  const dir = fileURLToPath(new URL('./src/content/programs', import.meta.url))
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .filter((file) => /^unlisted:\s*true\s*$/m.test(readFileSync(`${dir}/${file}`, 'utf-8')))
    .map((file) => file.replace(/\.\w+\.md$/, ''))
}

const unlistedSlugs = unlistedProgramSlugs()

// https://astro.build/config
export default defineConfig({
  site: 'https://markkinavihreat.fi/',
  base,
  trailingSlash: 'always',
  output: 'static',
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      filter: (page) => !unlistedSlugs.some((slug) => page.includes(`/ehdotukset/${slug}/`)),
    }),
  ],
})
