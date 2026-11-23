// Markkinavihreät carousel renderer: one deck.json in, every publish file out.
//
//   node social/carousel/render.mjs <slug>          # social/<slug>/deck.json
//   ONLY=2,3 node social/carousel/render.mjs <slug> # re-render some slides
//
// Writes, for N slides:
//   social/<slug>/dia-N.png                          2160×2700 review copies
//   social/<slug>/karuselli.png                      all slides in one row (preview)
//   public/social/<date>-<slug>-N.jpg                2160×2700 for Buffer (IG, LI, Threads…)
//   public/social/<date>-<slug>-tiktok-N.jpg         1080×1350 (TikTok caps 2,073,600 px)
// public/ is served at https://markkinavihreat.fi/social/… once the branch is pushed.
//
// Deck format and slide types: social/carousel/README.md. Text marked *like this*
// is the bright-green accent. The run fails (exit 1) when a slide's content
// overflows its frame or an alt text is over Buffer's 125-character limit.
//
// The look is the 2026-11-23 luontohaitat-hinta carousel (dark cover → light
// problem list → tint solution list → dark CTA), on the brand tokens in
// src/styles/global.css. Needs Playwright's Chromium (a repo devDep).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from '@playwright/test'
const { chromium } = pkg

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '../..')
const ICONS = join(REPO, 'social/yrittajan-paiva/assets')
const ALT_MAX = 125

const slug = process.argv[2]
if (!slug) {
  console.error('usage: node social/carousel/render.mjs <slug>')
  process.exit(2)
}
const DIR = join(REPO, 'social', slug)
const deck = JSON.parse(readFileSync(join(DIR, 'deck.json'), 'utf8'))
if (!/^\d{4}-\d{2}-\d{2}$/.test(deck.date ?? '')) {
  console.error('deck.json: "date" (YYYY-MM-DD) is required')
  process.exit(2)
}
const BASE = `${deck.date}-${slug}`

// ---- brand tokens (from src/styles/global.css) ----
const C = {
  kerma: '#efeee9',
  musta: '#161a14',
  metsa: '#122c12',
  vihrea: '#6eb82a',
  brand: '#006845',
  terra: '#c95b3d',
  surfaceGreen: '#dde3d4',
  mutedOnLight: '#4b5147',
  mutedOnTint: '#3a4f3a',
  mutedOnDark: '#c4d3ba',
}

const b64 = (p) => readFileSync(p).toString('base64')
const fontSemi = b64(join(REPO, 'src/assets/fonts/HankenGrotesk-SemiBold.ttf'))
const fontExtra = b64(join(REPO, 'src/assets/fonts/HankenGrotesk-ExtraBold.ttf'))

function svg(path, from, to) {
  return readFileSync(path, 'utf8')
    .replace(from, to)
    .replace(/\s(width|height)="[^"]*"/g, '')
}
const swipe = svg(join(ICONS, 'nuoli.svg'), /#006845/gi, C.vihrea)
const globe = svg(join(REPO, 'src/assets/vihreat-logo.svg'), /#006845/gi, '#ffffff')
const fullLogo = readFileSync(join(ICONS, 'vihreat-logo-neg.svg'), 'utf8')

// ---- text helpers: escape, then *accent* → green span ----
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="accent">$1</span>')

const MARK = { x: '<span class="x">✕</span>', ok: '<span class="x x--ok">✓</span>' }

const eyebrow = deck.eyebrow ?? 'Markkinavihreät'
const total = deck.slides.length

function header(i) {
  if (i === 0) {
    return `<header class="top"><span class="eyebrow">${esc(eyebrow)}</span><span class="logo-sm">${globe}</span></header>`
  }
  return `<header class="top"><span class="eyebrow">${esc(eyebrow)}</span><span class="page">${i + 1} / ${total}</span></header>`
}

const render = {
  cover: (s, i) => ({
    theme: 'dark',
    html: `${header(i)}
      <div class="grow center">
        <h1 class="cover-title">${rich(s.title)}</h1>
        ${s.lines?.length ? `<p class="cover-sub">${s.lines.map(rich).join('<br>')}</p>` : ''}
      </div>
      <footer class="foot"><span></span><span class="swipe">${swipe}</span></footer>`,
  }),
  list: (s, i) => ({
    theme: s.theme ?? 'light',
    html: `${header(i)}
      <div class="lead"><h2 class="title">${rich(s.title)}</h2></div>
      ${s.intro ? `<p class="intro">${rich(s.intro)}</p>` : ''}
      <ul class="bullets">${s.items.map((t) => `<li>${MARK[s.mark ?? 'x']}<span>${rich(t)}</span></li>`).join('')}</ul>
      ${s.kicker ? `<div class="kicker${s.kicker.length > 60 ? ' kicker--sm' : ''}">${rich(s.kicker)}</div>` : ''}`,
  }),
  cta: (s, i) => ({
    theme: 'dark',
    html: `${header(i)}
      <div class="grow center">
        <p class="cta-lead">${rich(s.text)}</p>
        <p class="cta-read"><span class="cta-url">${esc(s.url ?? 'markkinavihreat.fi')}</span></p>
      </div>
      <footer class="foot foot--center"><span class="logo-full">${fullLogo}</span></footer>`,
  }),
}

const errors = []
const slides = deck.slides.map((s, i) => {
  if (!render[s.type]) errors.push(`slide ${i + 1}: unknown type "${s.type}" (cover | list | cta)`)
  if (!s.alt) errors.push(`slide ${i + 1}: "alt" is missing`)
  else if (s.alt.length > ALT_MAX)
    errors.push(`slide ${i + 1}: alt is ${s.alt.length} chars, Buffer max ${ALT_MAX}`)
  return render[s.type]?.(s, i)
})
if (errors.length) {
  errors.forEach((e) => console.error(`FAIL ${e}`))
  process.exit(1)
}

const css = `
  @font-face { font-family:'Hanken Grotesk'; font-weight:600; font-style:normal;
    src:url(data:font/ttf;base64,${fontSemi}) format('truetype'); }
  @font-face { font-family:'Hanken Grotesk'; font-weight:800; font-style:normal;
    src:url(data:font/ttf;base64,${fontExtra}) format('truetype'); }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Hanken Grotesk', sans-serif; font-weight:600; -webkit-font-smoothing:antialiased; }
  .slide { width:1080px; height:1350px; overflow:hidden; position:relative; }
  .pad { position:absolute; inset:0; padding:92px 88px; display:flex; flex-direction:column; }
  .theme-light { background:${C.kerma}; color:${C.musta}; }
  .theme-tint  { background:${C.surfaceGreen}; color:${C.metsa}; }
  .theme-dark  { background:${C.metsa}; color:${C.kerma}; }

  .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:52px; }
  .eyebrow { font-weight:800; font-size:27px; letter-spacing:0.16em; text-transform:uppercase; }
  .theme-light .eyebrow, .theme-tint .eyebrow { color:${C.brand}; }
  .theme-dark .eyebrow { color:${C.vihrea}; }
  .page { font-size:25px; font-weight:600; opacity:0.5; }
  .logo-sm { margin:-20px 0; }
  .logo-sm svg { width:70px; height:70px; display:block; }
  .logo-full svg { width:250px; height:auto; display:block; }

  .lead { display:flex; align-items:flex-start; gap:26px; margin:40px 0 28px; }
  .title { font-weight:800; font-size:72px; line-height:1.04; letter-spacing:-0.015em; }

  .intro { font-weight:600; font-size:35px; line-height:1.35; margin-bottom:38px; }
  .theme-light .intro { color:${C.mutedOnLight}; }
  .theme-tint .intro { color:${C.mutedOnTint}; }

  .bullets { list-style:none; display:flex; flex-direction:column; gap:28px; }
  .bullets li { display:flex; align-items:flex-start; gap:24px; font-size:38px; font-weight:600; line-height:1.28; }
  .x { flex:0 0 auto; width:50px; height:50px; border-radius:12px; background:${C.terra}; color:${C.kerma};
    display:flex; align-items:center; justify-content:center; font-size:27px; font-weight:800; margin-top:3px; }
  .x--ok { background:${C.brand}; }

  .kicker { margin-top:auto; background:${C.metsa}; color:${C.kerma}; border-radius:28px;
    padding:40px 42px; font-size:44px; font-weight:800; line-height:1.18; letter-spacing:-0.01em; }
  .kicker--sm { font-size:38px; line-height:1.24; }

  .grow { flex:1; display:flex; flex-direction:column; }
  .center { justify-content:center; }
  .cover-title { font-weight:800; font-size:100px; line-height:1.0; letter-spacing:-0.02em; margin-bottom:44px; }
  .accent { color:${C.vihrea}; }
  .cover-sub { font-size:40px; font-weight:600; line-height:1.32; margin-bottom:26px; color:${C.mutedOnDark}; max-width:880px; }

  .foot { display:flex; justify-content:space-between; align-items:center; margin-top:auto; }
  .foot--center { justify-content:center; }
  .swipe svg { width:96px; height:96px; display:block; }

  .cta-lead { font-size:76px; font-weight:800; line-height:1.06; letter-spacing:-0.015em; margin:36px 0 44px; }
  .cta-read { font-size:36px; font-weight:600; line-height:1.32; color:${C.mutedOnDark}; }
  .cta-url { color:${C.vihrea}; font-weight:800; }
`

const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null
const html = `<!doctype html><html lang="fi"><head><meta charset="utf-8"><style>${css}</style></head>
<body>${slides
  .map(
    (s, i) =>
      `<div class="slide theme-${s.theme}" id="slide-${i + 1}"><div class="pad">${s.html}</div></div>`,
  )
  .join('')}</body></html>`

const browser = await chromium.launch()
const page = await (
  await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 })
).newPage()
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(async () => {
  await document.fonts.ready
})

// Overflow guard: content taller than the frame would be clipped silently.
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll('.pad')]
    .map((el, i) => (el.scrollHeight > el.clientHeight ? i + 1 : null))
    .filter(Boolean),
)
if (overflow.length) {
  console.error(
    `FAIL slide(s) ${overflow.join(', ')}: content overflows the frame — shorten the text`,
  )
  await browser.close()
  process.exit(1)
}

for (let i = 1; i <= slides.length; i++) {
  if (only && !only.includes(i)) continue
  const el = page.locator(`#slide-${i}`)
  await el.screenshot({ path: join(DIR, `dia-${i}.png`) })
  await el.screenshot({
    path: join(REPO, `public/social/${BASE}-${i}.jpg`),
    type: 'jpeg',
    quality: 90,
  })
  await el.screenshot({
    path: join(REPO, `public/social/${BASE}-tiktok-${i}.jpg`),
    type: 'jpeg',
    quality: 90,
    scale: 'css',
  })
  console.log(`dia-${i}.png  public/social/${BASE}-${i}.jpg  public/social/${BASE}-tiktok-${i}.jpg`)
}

// Preview montage: every slide in one row, for review on a phone.
const imgs = deck.slides
  .map((_, i) => `<img src="data:image/png;base64,${b64(join(DIR, `dia-${i + 1}.png`))}">`)
  .join('')
await page.setViewportSize({ width: 600 * total, height: 800 })
await page.setContent(
  `<!doctype html><html><head><style>body{margin:0;background:#dcdcd6}
  #m{display:flex;gap:24px;padding:24px;width:max-content}
  img{width:540px;height:675px;display:block;border-radius:12px}</style></head>
  <body><div id="m">${imgs}</div></body></html>`,
  { waitUntil: 'load' },
)
await page.locator('#m').screenshot({ path: join(DIR, 'karuselli.png'), scale: 'css' })

// Media list for the Buffer posts.yaml (lavanti-2027), alt texts included.
const media = (suffix) =>
  deck.slides
    .map(
      (s, i) =>
        `      - url: "https://markkinavihreat.fi/social/${BASE}-${suffix}${i + 1}.jpg"\n        alt: ${JSON.stringify(s.alt)}`,
    )
    .join('\n')
writeFileSync(
  join(DIR, 'media.yaml'),
  `# Paste under each platform's media: in <date>-<slug>-posts.yaml (lavanti-2027).\ndefault:\n${media('')}\ntiktok:\n${media('tiktok-')}\n`,
)
await browser.close()
console.log(`karuselli.png  media.yaml — done`)
