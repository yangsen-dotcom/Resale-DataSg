import { expect, test } from '@playwright/test'
import { mockApi } from '../fixtures/api'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
})

test('lists transactions with filters, sorting, and pagination', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Explore Resale Transactions' })).toBeVisible()

  const rows = page.locator('table tbody tr')
  await expect(rows).toHaveCount(20)
  await expect(page.getByText('Page 1 of 2')).toBeVisible()
})

test('filtering by town only shows that town in the results', async ({ page }) => {
  const filtered = page.waitForResponse((r) => r.url().includes('/api/transactions?') && r.url().includes('town=BEDOK'))
  // The checkbox itself is visually replaced by the chip label, so click the
  // visible label text (native label->input delegation) rather than .check(),
  // which tries to hit the (covered) input directly.
  await page.getByRole('group', { name: 'Town' }).getByText('BEDOK', { exact: true }).click()
  await filtered

  const townCells = page.locator('table tbody tr td:nth-child(2)')
  await expect(townCells.first()).toHaveText('BEDOK')
  const towns = await townCells.allTextContents()
  expect(towns.length).toBeGreaterThan(0)
  expect(towns.every((t) => t === 'BEDOK')).toBe(true)
})

test('sorting by resale price re-orders the table', async ({ page }) => {
  const sorted = page.waitForResponse((r) => r.url().includes('/api/transactions?') && r.url().includes('sort=resalePrice'))
  await page.getByRole('button', { name: 'Resale Price (SGD)' }).click()
  await sorted

  const priceCells = page.locator('table tbody tr td:last-child')
  await expect(priceCells.first()).not.toHaveText('')
  const prices = (await priceCells.allTextContents()).map((t) => Number(t.replace(/[^0-9.]/g, '')))
  const sortedDesc = [...prices].sort((a, b) => b - a)
  expect(prices).toEqual(sortedDesc)
})

test('paginates to the next page', async ({ page }) => {
  await expect(page.getByText('Page 1 of 2')).toBeVisible()
  await page.getByRole('button', { name: 'Next →' }).click()
  await expect(page.getByText('Page 2 of 2')).toBeVisible()
  await expect(page.locator('table tbody tr')).toHaveCount(5)
})
