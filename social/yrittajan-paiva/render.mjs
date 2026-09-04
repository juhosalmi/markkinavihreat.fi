// Renders the Yrittäjän päivä Instagram carousel (6 slides, 1080×1350 @2x)
// into this folder as dia-1.png … dia-6.png.
//
//   Run:      node social/yrittajan-paiva/render.mjs
//   One slide: ONLY=6 node social/yrittajan-paiva/render.mjs
//   Elsewhere: OUT=/tmp node social/yrittajan-paiva/render.mjs
//
// Self-contained: icons + the negative Vihreät logo live in ./assets, fonts
// come from the site's src/assets/fonts, and the globe symbol from
// src/assets/vihreat-logo.svg. Needs Playwright's Chromium (a repo devDep).
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from '@playwright/test'
const { chromium } = pkg

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '../..')
const ICONS = join(HERE, 'assets')
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

// ---- icons: single-path SVGs filled #006845; recolor by replacing the hex ----
function icon(name, color) {
  let svg = readFileSync(join(ICONS, `${name}.svg`), 'utf8')
  svg = svg.replace(/#006845/gi, color)
  // strip fixed width/height so CSS controls size; keep viewBox
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '')
  return svg
}
// Globe symbol (maapallosymboli). On dark grounds recolor to white per the
// party brand guideline (nega version); green on light.
function logo(color) {
  let svg = readFileSync(join(REPO, 'src/assets/vihreat-logo.svg'), 'utf8')
  svg = svg.replace(/#006845/gi, color)
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '')
  return svg
}
// Full horizontal Vihreät logo with three-language wordmark (negative/white).
function fullLogo(color) {
  let svg = readFileSync(join(ICONS, 'vihreat-logo-neg.svg'), 'utf8')
  svg = svg.replace(/#ffffff\b/gi, color).replace(/#fff\b/gi, color)
  return svg
}

const x = '<span class="x">✕</span>'
const bullets = (items) =>
  `<ul class="bullets">${items.map((t) => `<li>${x}<span>${t}</span></li>`).join('')}</ul>`
const solution = (t) =>
  `<div class="solution"><span class="sol-label">Markkinavihreät haluavat:</span> ${t}</div>`

// ---- slides ----
const slides = [
  // DIA 1 — cover (dark)
  {
    theme: 'dark',
    html: `
      <header class="top">
        <span class="eyebrow">Yrittäjän päivä</span>
        <span class="logo-sm">${logo('#ffffff')}</span>
      </header>
      <div class="grow center">
        <h1 class="cover-title">Yrittäminen on<br><span class="accent">rohkeutta.</span></h1>
        <p class="cover-sub">Mutta Suomessa yrittäjän tiellä on esteitä.</p>
        <p class="cover-sub cover-sub--strong">Yrittäjän päivän kunniaksi markkinavihreät näyttävät kolme keinoa, joilla ne poistetaan.</p>
      </div>
      <footer class="foot">
        <span class="url-sm">markkinavihreat.fi</span>
        <span class="swipe">${icon('nuoli', C.vihrea)}</span>
      </footer>`,
  },
  // DIA 2 — YEL (light)
  {
    theme: 'light',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">2 / 6</span></header>
      <div class="icon">${icon('euro', C.brand)}</div>
      <div class="lead"><span class="num">1</span><h2 class="title">YEL todellisiin, reaaliaikaisiin tuloihin</h2></div>
      <p class="intro">Yrittäjän eläkemaksun pitäisi seurata oikeita tuloja. Nyt se ei seuraa:</p>
      ${bullets([
        'Maksut perustuvat jopa 2 vuotta vanhoihin tietoihin',
        'Ei tuloja = silti vähintään ~200 €/kk maksu',
        'Sairastuessa maksut poikki vasta 3 kk jälkeen',
      ])}
      ${solution('Yrittäjän turvan, joka joustaa elämän mukana — ei kiinteää maksua silloin, kun tuloja ei ole.')}`,
  },
  // DIA 3 — konkurssi (tint)
  {
    theme: 'tint',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">3 / 6</span></header>
      <div class="icon">${icon('kierratys', C.brand)}</div>
      <div class="lead"><span class="num">2</span><h2 class="title">Konkurssista on voitava nousta uuteen alkuun</h2></div>
      <p class="intro">Konkurssin tehnyt osaa enemmän kuin ennen. Silti järjestelmä rankaisee:</p>
      ${bullets([
        'Maksuhäiriö estää starttirahan ja tilit',
        'Verottaja voi estää uuden yrityksen perustamisen',
        'Vanhat velat jäävät painamaan henkilökohtaisesti',
      ])}
      ${solution('Jokaiselle reilun uuden alun konkurssin jälkeen — ilman rangaistusleimaa.')}`,
  },
  // DIA 4 — ensimmäinen työntekijä (light)
  {
    theme: 'light',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">4 / 6</span></header>
      <div class="icon">${icon('ratas', C.brand)}</div>
      <div class="lead"><span class="num">3</span><h2 class="title">Ensimmäinen työntekijä ilman sivukuluja</h2></div>
      <p class="intro">Moni yrittäjä haluaisi kasvaa, mutta ensimmäinen rekry on liian iso riski:</p>
      ${bullets([
        'Sivukulut tekevät palkkaamisesta kallista',
        'Byrokratia syö ajan ja motivaation',
        'Työpaikkoja ei synny, koska kynnys on liian korkea',
      ])}
      ${solution('Ensimmäisen työntekijän palkkaamisesta pienelle yritykselle mahdollisuuden, ei riskiä.')}`,
  },
  // DIA 5 — bonus EU (tint)
  {
    theme: 'tint',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">5 / 6</span></header>
      <div class="icon">${icon('eurooppa', C.brand)}</div>
      <div class="lead"><span class="badge">Bonus</span><h2 class="title">Yksi luukku koko EU:n pakkauksille</h2></div>
      <p class="intro">Pieni verkkokauppa toiseen EU-maahan törmää seinään:</p>
      ${bullets([
        'Pakkaukset on rekisteröitävä erikseen jokaisessa 27 maassa',
        'Tuottajavastuumaksut lankeavat joka maahan erikseen',
        'Joka maahan on nimettävä oma paikallinen edustaja',
      ])}
      ${solution('Yhtenäiset EU-säännöt, joilla pienikin verkkokauppa myy koko unioniin yhdellä ilmoituksella.')}`,
  },
  // DIA 6 — CTA (dark)
  {
    theme: 'dark',
    html: `
      <header class="top"><span class="eyebrow">Markkinavihreät</span><span class="page">6 / 6</span></header>
      <div class="grow center">
        <div class="icon icon--sm">${icon('kirja', C.vihrea)}</div>
        <p class="cta-lead">Nämä ovat <span class="accent">markkinavihreitä</span> ratkaisuja. Puretaan turhat esteet ja annetaan yrittäjyydelle tilaa kukoistaa.</p>
        <p class="cta-read">Lue koko avaus: <span class="cta-url">markkinavihreat.fi</span></p>
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
  .logo-sm svg { width:70px; height:70px; display:block; }
  .logo-full svg { width:250px; height:auto; display:block; }

  .icon svg { width:132px; height:132px; display:block; }
  .icon--lg svg { width:150px; height:150px; }
  .icon--sm svg { width:104px; height:104px; }

  .lead { display:flex; align-items:flex-start; gap:26px; margin:40px 0 28px; }
  .num { font-weight:800; font-size:104px; line-height:0.82; color:${C.brand}; }
  .theme-tint .num { color:${C.brand}; }
  .badge { font-weight:800; font-size:26px; letter-spacing:0.12em; text-transform:uppercase;
    background:${C.terra}; color:${C.kerma}; padding:12px 22px; border-radius:14px; white-space:nowrap; }
  .title { font-weight:800; font-size:60px; line-height:1.06; letter-spacing:-0.015em; }

  .intro { font-weight:600; font-size:33px; line-height:1.35; margin-bottom:34px; }
  .theme-light .intro { color:${C.mutedOnLight}; }
  .theme-tint .intro { color:${C.mutedOnTint}; }

  .bullets { list-style:none; display:flex; flex-direction:column; gap:24px; }
  .bullets li { display:flex; align-items:flex-start; gap:24px; font-size:34px; font-weight:600; line-height:1.28; }
  .x { flex:0 0 auto; width:48px; height:48px; border-radius:12px; background:${C.terra}; color:${C.kerma};
    display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:800; margin-top:4px; }

  .solution { margin-top:auto; background:${C.brand}; color:${C.kerma}; border-radius:28px;
    padding:38px 40px; font-size:35px; font-weight:600; line-height:1.32; }
  .sol-label { font-weight:800; }

  .grow { flex:1; display:flex; flex-direction:column; }
  .center { justify-content:center; }
  .cover-title { font-weight:800; font-size:104px; line-height:1.0; letter-spacing:-0.02em; margin-bottom:44px; }
  .accent { color:${C.vihrea}; }
  .cover-sub { font-size:40px; font-weight:600; line-height:1.32; margin-bottom:26px; color:${C.mutedOnDark}; max-width:840px; }
  .cover-sub--strong { color:${C.kerma}; font-weight:800; }

  .foot { display:flex; justify-content:space-between; align-items:center; margin-top:auto; }
  .foot--center { justify-content:center; }
  .url-sm { font-size:34px; font-weight:800; color:${C.kerma}; }
  .swipe svg { width:96px; height:96px; display:block; }

  .cta-lead { font-size:64px; font-weight:800; line-height:1.1; letter-spacing:-0.015em; margin:36px 0 44px; }
  .cta-read { font-size:34px; font-weight:600; color:${C.mutedOnDark}; }
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
  const box = await page.locator(`#slide-${i}`).boundingBox()
  console.log(`dia-${i}.png  (element ${box.width}x${box.height} @2x)`)
}

await browser.close()
console.log('done')
