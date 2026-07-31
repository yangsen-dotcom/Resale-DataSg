import { expect, test } from '@playwright/test'
import { mockApi, TRANSACTIONS } from '../fixtures/api'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto('/map')
})

test('selecting a town then a block shows that block\'s transactions', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Map' })).toBeVisible()

  await page.getByLabel('Town').selectOption('BEDOK')
  await expect(page.getByLabel('Block')).toBeVisible()

  await page.getByLabel('Block').selectOption('123')
  await expect(page.getByRole('heading', { name: 'Transactions at Block 123, BEDOK' })).toBeVisible()

  const expectedCount = TRANSACTIONS.filter((t) => t.town === 'BEDOK' && t.block === '123').length
  const rows = page.locator('table tbody tr')
  await expect(rows).toHaveCount(expectedCount)
  await expect(rows.first()).toContainText('BEDOK')
})

test('switching town resets the block selection', async ({ page }) => {
  await page.getByLabel('Town').selectOption('BEDOK')
  await page.getByLabel('Block').selectOption('123')
  await expect(page.getByRole('heading', { name: /Transactions at Block/ })).toBeVisible()

  await page.getByLabel('Town').selectOption('TAMPINES')
  await expect(page.getByRole('heading', { name: /Transactions at Block/ })).not.toBeVisible()
  await expect(page.getByLabel('Block')).toHaveValue('')
})
