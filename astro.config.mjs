// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// Set by the GitHub Pages preview workflow to serve from a repo subpath
// (e.g. "/markkinavihreat.fi"); unset everywhere else, including the
// Cloudflare production deploy, which serves from "/".
const base = process.env.BASE_PATH || '/'

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

  integrations: [sitemap()],
})
