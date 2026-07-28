import { expect, test } from '@playwright/test'

const locales: { path: string; homeHref: string }[] = [
  { path: '/', homeHref: '/' },
  { path: '/sv/', homeHref: '/' },
  { path: '/en/', homeHref: '/' },
]

for (const { path } of locales) {
  test(`homepage renders and nav works (${path})`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('nav a', { hasText: 'markkina' })).toBeVisible()
  })
}

test('language switcher moves between fi, sv and en on the same page', async ({ page }) => {
  await page.goto('/manifesti/')
  await expect(page).toHaveURL(/\/manifesti\/$/)

  await page.getByRole('link', { name: 'SV', exact: true }).click()
  await expect(page).toHaveURL(/\/sv\/manifesti\/$/)

  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/manifesti\/$/)
})
