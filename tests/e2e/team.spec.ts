import { expect, test } from '@playwright/test'

test('gallery card leads to the person page', async ({ page }) => {
  await page.goto('/ketka/')
  await page.getByRole('link', { name: 'Lauri Lavanti', exact: true }).click()
  await expect(page).toHaveURL(/\/ketka\/lauri-lavanti\/$/)
  await expect(page.locator('h1')).toHaveText('Lauri Lavanti')
})

test('person page links to the programs and posts they are part of', async ({ page }) => {
  await page.goto('/ketka/lauri-lavanti/')
  await expect(page.locator('a[href="/ehdotukset/lisaa-markkinoita/"]')).toBeVisible()
  await expect(
    page.locator('a[href="/blogi/2026-09-10/vakaa-ymparisto-tuo-investointeja/"]'),
  ).toBeVisible()
})

test('person page emits Person JSON-LD with sameAs', async ({ page }) => {
  await page.goto('/ketka/lauri-lavanti/')
  const raw = await page.locator('script[type="application/ld+json"]').textContent()
  const graph = JSON.parse(raw!)['@graph'] as Array<Record<string, unknown>>
  const person = graph.find((node) => node['@type'] === 'Person')
  expect(person?.['@id']).toBe('https://markkinavihreat.fi/ketka/lauri-lavanti/#person')
  expect(person?.sameAs).toContain('https://lavanti.fi/fi/laurista/')
})

test('person page puts photo and bio side by side on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/ketka/lauri-lavanti/')
  const photo = await page.getByRole('img', { name: 'Lauri Lavanti' }).boundingBox()
  const heading = await page.locator('h1').boundingBox()
  expect(heading!.x).toBeGreaterThanOrEqual(photo!.x + photo!.width - 1)
  expect(heading!.y).toBeLessThan(photo!.y + photo!.height)
})

test('language switcher keeps the person', async ({ page }) => {
  await page.goto('/ketka/lauri-lavanti/')
  await page.getByRole('link', { name: 'SV', exact: true }).click()
  await expect(page).toHaveURL(/\/sv\/ketka\/lauri-lavanti\/$/)
})

test('blog byline links the author', async ({ page }) => {
  await page.goto('/blogi/2026-09-10/vakaa-ymparisto-tuo-investointeja/')
  await page.getByRole('link', { name: 'Lauri Lavanti' }).click()
  await expect(page).toHaveURL(/\/ketka\/lauri-lavanti\/$/)
})
