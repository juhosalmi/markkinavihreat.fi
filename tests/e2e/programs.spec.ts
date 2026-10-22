import { expect, test } from '@playwright/test'

const SLIDES_PATH = '/ehdotukset/palkalla-pitaa-voida-vaurastua/'

test('program slides offer a download per slide and the whole PDF', async ({ page }) => {
  await page.goto(SLIDES_PATH)
  const section = page.locator('section', { has: page.getByRole('heading', { name: 'Jaa kuvat' }) })

  await expect(section.locator('img')).toHaveCount(8)
  // Each per-slide button carries its slide number for screen readers.
  const first = section.getByRole('link', { name: 'Lataa 1/8', exact: true })
  await expect(first).toHaveAttribute('download', 'varallisuustili-1.jpg')
  await expect(section.getByRole('link', { name: 'Lataa kaikki (PDF)' })).toHaveAttribute(
    'download',
    'varallisuustili.pdf',
  )
  // The Finnish note only appears where the page language differs.
  await expect(section.getByText('Kuvat ovat suomeksi.')).toHaveCount(0)
})

test('program slides share falls back to copying the link without Web Share', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    // Force the desktop path regardless of the browser build.
    Object.defineProperty(navigator, 'share', { value: undefined })
    Object.defineProperty(navigator, 'canShare', { value: undefined })
  })
  await page.goto(SLIDES_PATH)

  // Located by slide, not by label: the label is what the click changes.
  const share = page.locator('button[data-src$="varallisuustili-1.jpg"]')
  await expect(share).toHaveAccessibleName('Jaa 1/8')
  await share.click()
  await expect(share).toHaveAccessibleName('Linkki kopioitu 1/8')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `https://markkinavihreat.fi${SLIDES_PATH}`,
  )
})

test('program slides note the Finnish language on other locales', async ({ page }) => {
  await page.goto(`/sv${SLIDES_PATH}`)
  await expect(page.getByText('Bilderna är på finska.')).toBeVisible()
  await expect(page.locator('img[lang="fi"]')).toHaveCount(8)
})

test('programs without slides have no slides section', async ({ page }) => {
  await page.goto('/ehdotukset/lisaa-markkinoita/')
  await expect(page.getByRole('heading', { name: 'Jaa kuvat' })).toHaveCount(0)
})
