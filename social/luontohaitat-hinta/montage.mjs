// Combines dia-1…dia-4.png into one preview image (karuselli.png), 4 in a row.
//   Run: node social/luontohaitat-hinta/montage.mjs
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from '@playwright/test'
const { chromium } = pkg

const HERE = dirname(fileURLToPath(import.meta.url))
const img = (i) =>
  `<img src="data:image/png;base64,${readFileSync(join(HERE, `dia-${i}.png`)).toString('base64')}">`
const html = `<!doctype html><html><head><style>
  body{margin:0;background:#dcdcd6}
  #m{display:flex;gap:24px;padding:24px;width:max-content}
  img{width:540px;height:675px;display:block;border-radius:12px}
</style></head><body><div id="m">${[1, 2, 3, 4].map(img).join('')}</div></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 2400, height: 800 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.locator('#m').screenshot({ path: join(HERE, 'karuselli.png') })
await browser.close()
console.log('karuselli.png')
