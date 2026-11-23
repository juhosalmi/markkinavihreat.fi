// Renders the "luontohaitoille hinta" Instagram carousel (4 slides,
// 1080×1350 @2x) into this folder as dia-1.png … dia-4.png.
// Same look as social/yrittajan-paiva (see social/pohjat/README.md).
//
//   Run:       node social/luontohaitat-hinta/render.mjs
//   One slide: ONLY=2 node social/luontohaitat-hinta/render.mjs
//
// Icons + the negative Vihreät logo are reused from ../yrittajan-paiva/assets,
// fonts come from src/assets/fonts. Needs Playwright's Chromium (a repo devDep).
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from '@playwright/test'
const { chromium } = pkg

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '../..')
const ICONS = join(HERE, '../yrittajan-paiva/assets')
const OUT = process.env.OUT || HERE

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

// ---- fonts (embed as base64 so headless Chromium never falls back) ----
const b64 = (p) => readFileSync(p).toString('base64')
const fontSemi = b64(join(REPO, 'src/assets/fonts/HankenGrotesk-SemiBold.ttf'))
const fontExtra = b64(join(REPO, 'src/assets/fonts/HankenGrotesk-ExtraBold.ttf'))

function icon(name, color) {
  let svg = readFileSync(join(ICONS, `${name}.svg`), 'utf8')
  svg = svg.replace(/#006845/gi, color)
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '')
  return svg
}
function logo(color) {
  let svg = readFileSync(join(REPO, 'src/assets/vihreat-logo.svg'), 'utf8')
  svg = svg.replace(/#006845/gi, color)
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '')
  return svg
}
function fullLogo(color) {
  let svg = readFileSync(join(ICONS, 'vihreat-logo-neg.svg'), 'utf8')
  svg = svg.replace(/#ffffff\b/gi, color).replace(/#fff\b/gi, color)
  return svg
}

const x = '<span class="x">✕</span>'
const ok = '<span class="x x--ok">✓</span>'
const bullets = (items, mark = x) =>
  `<ul class="bullets">${items.map((t) => `<li>${mark}<span>${t}</span></li>`).join('')}</ul>`
const solution = (t) =>
  `<div class="solution"><span class="sol-label">Markkinavihreät haluavat:</span> ${t}</div>`

// ---- slides ----
const slides = [
  // DIA 1: cover (dark)
  {
    theme: 'dark',
    html: `
      <header class="top">
        <span class="eyebrow">Markkinavihreät</span>
        <span class="logo-sm">${logo('#ffffff')}</span>
      </header>
      <div class="grow center">
        <h1 class="cover-title">Yli puolet suomalaisista haluaa saastuttamiselle <span class="accent">hinnan.</span></h1>
        <p class="cover-sub">Vaikka se vaikuttaisi arjen kustannuksiin<br>(Verian 23.11.2026)</p>
      </div>
      <footer class="foot">
        <span></span>
        <span class="swipe">${icon('nuoli', C.vihrea)}</span>
      </footer>`,
  },
  // DIA 2: problem (light)
  {
    theme: 'light',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">2 / 4</span></header>
      <div class="lead"><h2 class="title">Nyt hinta ei kerro totuutta</h2></div>
      <p class="intro">Kun luontohaitoilla ei ole hintaa:</p>
      ${bullets([
        'Tuotteen voi myydä halvalla, vaikka tuotanto saastuttaa',
        'Kestävämmin tuottava häviää hintakilpailussa',
        'Päästöjä ei lue kauppakuitissa',
      ])}
      <div class="kicker">Vika ei ole kuluttajassa <span class="accent">vaan hinnassa.</span></div>`,
  },
  // DIA 3: solution (tint)
  {
    theme: 'tint',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">3 / 4</span></header>
      <div class="lead"><h2 class="title">Entä jos saastuttaminen ei enää kannattaisi?</h2></div>
      <p class="intro">Kun luontohaitoille asetetaan hinta:</p>
      ${bullets(
        [
          'Saastuttaja maksaa aiheuttamistaan haitoista.',
          'Vastuulliset yritykset pärjäävät paremmin ja ympäristöinnovaatiot kannattavat.',
          'Kuluttajat voivat vertailla hintoja, jotka huomioivat myös ympäristöhaitat.',
        ],
        ok,
      )}
      <div class="kicker kicker--sm">Näin <span class="accent">markkinat</span> alkavat ohjata kestävämpiin valintoihin ja kestävään tuotantoon.</div>`,
  },
  // DIA 4: CTA (dark)
  {
    theme: 'dark',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">4 / 4</span></header>
      <div class="grow center">
        <p class="cta-lead">Tuodaan valintojen todelliset kustannukset näkyviin ja tehdään puhtaasta tuotannosta <span class="accent">kannattavampaa.</span></p>
        <p class="cta-read"><span class="cta-url">markkinavihreat.fi</span></p>
      </div>
      <footer class="foot foot--center"><span class="logo-full">${fullLogo('#ffffff')}</span></footer>`,
  },
]

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

  .icon svg { width:132px; height:132px; display:block; }
  .icon--sm svg { width:104px; height:104px; }

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

  .solution { margin-top:auto; background:${C.brand}; color:${C.kerma}; border-radius:28px;
    padding:38px 40px; font-size:36px; font-weight:600; line-height:1.32; }
  .sol-label { font-weight:800; }
  .kicker { margin-top:auto; background:${C.metsa}; color:${C.kerma}; border-radius:28px;
    padding:40px 42px; font-size:44px; font-weight:800; line-height:1.18; letter-spacing:-0.01em; }
  .kicker--sm { font-size:38px; line-height:1.24; }

  .grow { flex:1; display:flex; flex-direction:column; }
  .center { justify-content:center; }
  .cover-title { font-weight:800; font-size:100px; line-height:1.0; letter-spacing:-0.02em; margin-bottom:44px; }
  .accent { color:${C.vihrea}; }
  .cover-sub { font-size:40px; font-weight:600; line-height:1.32; margin-bottom:26px; color:${C.mutedOnDark}; max-width:880px; }
  .cover-sub--strong { color:${C.kerma}; font-weight:800; }
  .source { font-size:24px; font-weight:600; color:${C.mutedOnDark}; opacity:0.75; margin-top:18px; }

  .foot { display:flex; justify-content:space-between; align-items:center; margin-top:auto; }
  .foot--center { justify-content:center; }
  .url-sm { font-size:34px; font-weight:800; color:${C.kerma}; }
  .swipe svg { width:96px; height:96px; display:block; }

  .cta-lead { font-size:76px; font-weight:800; line-height:1.06; letter-spacing:-0.015em; margin:36px 0 44px; }
  .cta-read { font-size:36px; font-weight:600; line-height:1.32; color:${C.mutedOnDark}; }
  .cta-read--gap { margin-top:30px; }
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
const ctx = await browser.newContext({
  viewport: { width: 1080, height: 1350 },
  deviceScaleFactor: 2,
})
const page = await ctx.newPage()
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(async () => {
  await document.fonts.ready
})

for (let i = 1; i <= slides.length; i++) {
  if (only && !only.includes(i)) continue
  const file = join(OUT, `dia-${i}.png`)
  await page.locator(`#slide-${i}`).screenshot({ path: file })
  console.log(`dia-${i}.png`)
  // Publish copy for Buffer: served at markkinavihreat.fi/social/…
  const jpg = join(REPO, `public/social/2026-11-23-luontohaitat-hinta-${i}.jpg`)
  await page.locator(`#slide-${i}`).screenshot({ path: jpg, type: 'jpeg', quality: 90 })
  // TikTok caps images at 2,073,600 px, so it gets a 1x (1080×1350) copy.
  const tt = join(REPO, `public/social/2026-11-23-luontohaitat-hinta-tiktok-${i}.jpg`)
  await page
    .locator(`#slide-${i}`)
    .screenshot({ path: tt, type: 'jpeg', quality: 90, scale: 'css' })
}

await browser.close()
console.log('done')
