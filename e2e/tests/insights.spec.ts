import { expect, test } from '@playwright/test'
import { mockApi } from '../fixtures/api'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto('/insights')
})

test('shows the towns comparison chart by default', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Resale Price Insights' })).toBeVisible()
  await expect(page.getByRole('img', { name: /average resale price comparison between towns/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'BEDOK' })).toHaveAttribute('aria-pressed', 'true')
})

test('switches through every comparison dimension', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Insights dimension' })

  await nav.getByRole('button', { name: 'Flat Types' }).click()
  await expect(page.getByRole('img', { name: /average resale price comparison between flat types/i })).toBeVisible()

  await nav.getByRole('button', { name: 'Remain Lease' }).click()
  await expect(page.getByRole('img', { name: /average resale price by remaining lease years/i })).toBeVisible()

  await nav.getByRole('button', { name: 'Storey Range' }).click()
  await expect(page.getByRole('img', { name: /average resale price by storey range/i })).toBeVisible()

  await nav.getByRole('button', { name: 'Town × Flat Type' }).click()
  await expect(page.getByRole('table', { name: /average resale price by town and flat type/i })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '3 ROOM' })).toBeVisible()
  await expect(page.getByRole('rowheader', { name: 'BEDOK' })).toBeVisible()

  await nav.getByRole('button', { name: 'Area' }).click()
  await expect(page.getByRole('img', { name: /median floor area by month/i })).toBeVisible()

  await nav.getByRole('button', { name: 'Towns' }).click()
  await expect(page.getByRole('img', { name: /average resale price comparison between towns/i })).toBeVisible()
})

test('toggling a town in the legend hides it from the chart summary', async ({ page }) => {
  const bedok = page.getByRole('button', { name: 'BEDOK' })
  await expect(bedok).toHaveAttribute('aria-pressed', 'true')
  await bedok.click()
  await expect(bedok).toHaveAttribute('aria-pressed', 'false')
})
