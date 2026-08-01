import type { Page } from '@playwright/test'

export const TOWNS = ['ANG MO KIO', 'BEDOK', 'TAMPINES']
export const FLAT_TYPES = ['2 ROOM', '3 ROOM', '4 ROOM']

const FLAT_MODELS = ['New Generation', 'Improved', 'Model A']

export const BLOCKS_BY_TOWN: Record<string, { block: string; streetName: string }[]> = {
  BEDOK: [
    { block: '123', streetName: 'BEDOK NORTH RD' },
    { block: '456', streetName: 'BEDOK SOUTH AVE' },
  ],
  'ANG MO KIO': [{ block: '308', streetName: 'ANG MO KIO AVE 1' }],
  TAMPINES: [{ block: '854', streetName: 'TAMPINES ST 81' }],
}

// 25 rows so a 20-per-page listing spans exactly two pages - enough to
// exercise real pagination and sort behaviour instead of a single fixed page.
// Block/street always come from BLOCKS_BY_TOWN for the row's own town, so a
// combined town+block filter (as the Map page sends) is never inconsistent.
export const TRANSACTIONS = Array.from({ length: 25 }, (_, i) => {
  const town = TOWNS[i % TOWNS.length]
  const flatType = FLAT_TYPES[i % FLAT_TYPES.length]
  const blocksForTown = BLOCKS_BY_TOWN[town]
  const { block, streetName } = blocksForTown[i % blocksForTown.length]
  return {
    id: i + 1,
    month: `2023-${String((i % 12) + 1).padStart(2, '0')}`,
    town,
    flatType,
    block,
    streetName,
    storeyRange: `${String((i % 4) * 3 + 1).padStart(2, '0')} TO ${String((i % 4) * 3 + 3).padStart(2, '0')}`,
    floorAreaSqm: 70 + (i % 10) * 5,
    flatModel: FLAT_MODELS[i % FLAT_MODELS.length],
    leaseCommenceDate: 1980 + (i % 20),
    remainingLease: `${56 + (i % 20)} years 0${i % 10} month`,
    resalePrice: 300_000 + i * 15_000,
  }
})

function sortTransactions(field: string, direction: string) {
  const sorted = [...TRANSACTIONS].sort((a, b) => {
    const av = a[field as keyof (typeof TRANSACTIONS)[number]]
    const bv = b[field as keyof (typeof TRANSACTIONS)[number]]
    if (av < bv) return -1
    if (av > bv) return 1
    return 0
  })
  return direction === 'desc' ? sorted.reverse() : sorted
}

/**
 * Intercepts every /api/** call the built frontend makes and fulfils it with
 * fixture data, so tests exercise the real production bundle in a real
 * browser engine without needing the Spring Boot backend, Postgres, Redis, or
 * a live data.gov.sg call running anywhere.
 */
export async function mockApi(page: Page) {
  await page.route('**/api/transactions?**', async (route) => {
    const url = new URL(route.request().url())
    const page_ = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '20')
    const [field, direction] = (url.searchParams.get('sort') ?? 'month,desc').split(',')
    const town = url.searchParams.getAll('town')
    const block = url.searchParams.get('block')

    let rows = sortTransactions(field, direction)
    if (town.length > 0) {
      rows = rows.filter((r) => town.includes(r.town))
    }
    if (block) {
      rows = rows.filter((r) => r.block === block)
    }

    const start = page_ * size
    const content = rows.slice(start, start + size)
    await route.fulfill({
      json: {
        content,
        page: page_,
        size,
        totalElements: rows.length,
        totalPages: Math.max(1, Math.ceil(rows.length / size)),
      },
    })
  })

  await page.route('**/api/transactions/towns', (route) => route.fulfill({ json: TOWNS }))
  await page.route('**/api/transactions/flat-types', (route) => route.fulfill({ json: FLAT_TYPES }))
  await page.route('**/api/transactions/blocks**', (route) => {
    const url = new URL(route.request().url())
    const town = url.searchParams.get('town') ?? ''
    route.fulfill({ json: BLOCKS_BY_TOWN[town] ?? [] })
  })

  await page.route('**/api/insights/price-trend-by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', period: '2023', averagePrice: 450000, transactionCount: 3000 },
        { town: 'BEDOK', period: '2023', averagePrice: 498000, transactionCount: 5230 },
        { town: 'TAMPINES', period: '2023', averagePrice: 520000, transactionCount: 4100 },
      ],
    }),
  )
  await page.route('**/api/insights/price-trend-by-flat-type**', (route) =>
    route.fulfill({
      json: [
        { flatType: '2 ROOM', period: '2023', averagePrice: 300000, transactionCount: 800 },
        { flatType: '3 ROOM', period: '2023', averagePrice: 380000, transactionCount: 2100 },
        { flatType: '4 ROOM', period: '2023', averagePrice: 498000, transactionCount: 5230 },
      ],
    }),
  )
  await page.route('**/api/insights/max-price-trend-by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', period: '2023', maxPrice: 760000, transactionCount: 3000 },
        { town: 'BEDOK', period: '2023', maxPrice: 880000, transactionCount: 5230 },
        { town: 'TAMPINES', period: '2023', maxPrice: 910000, transactionCount: 4100 },
      ],
    }),
  )
  await page.route('**/api/insights/min-price-trend-by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', period: '2023', minPrice: 260000, transactionCount: 3000 },
        { town: 'BEDOK', period: '2023', minPrice: 280000, transactionCount: 5230 },
        { town: 'TAMPINES', period: '2023', minPrice: 300000, transactionCount: 4100 },
      ],
    }),
  )
  await page.route('**/api/insights/median-price-trend-by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', period: '2023', medianPrice: 440000, transactionCount: 3000 },
        { town: 'BEDOK', period: '2023', medianPrice: 480000, transactionCount: 5230 },
        { town: 'TAMPINES', period: '2023', medianPrice: 500000, transactionCount: 4100 },
      ],
    }),
  )
  await page.route('**/api/insights/price-per-sqm-trend-by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', period: '2023', pricePerSqm: 5100, transactionCount: 3000 },
        { town: 'BEDOK', period: '2023', pricePerSqm: 5400, transactionCount: 5230 },
        { town: 'TAMPINES', period: '2023', pricePerSqm: 5600, transactionCount: 4100 },
      ],
    }),
  )
  await page.route('**/api/insights/area-trend**', (route) =>
    route.fulfill({
      json: [
        { period: '2023-01', medianArea: 90, transactionCount: 2000 },
        { period: '2023-02', medianArea: 95, transactionCount: 1800 },
      ],
    }),
  )
  await page.route('**/api/insights/average-price-by-remaining-lease**', (route) =>
    route.fulfill({
      json: [
        { remainingLeaseYears: 60, averagePrice: 400000, transactionCount: 1200 },
        { remainingLeaseYears: 61, averagePrice: 420000, transactionCount: 900 },
        { remainingLeaseYears: 62, averagePrice: 440000, transactionCount: 700 },
      ],
    }),
  )
  await page.route('**/api/insights/average-price-by-storey-range**', (route) =>
    route.fulfill({
      json: [
        { storeyRange: '01 TO 03', averagePrice: 400000, transactionCount: 1200 },
        { storeyRange: '04 TO 06', averagePrice: 420000, transactionCount: 900 },
        { storeyRange: '07 TO 09', averagePrice: 440000, transactionCount: 700 },
      ],
    }),
  )
  await page.route('**/api/insights/average-price-by-town-and-flat-type**', (route) =>
    route.fulfill({
      json: [
        { town: 'BEDOK', flatType: '3 ROOM', averagePrice: 380000, transactionCount: 1200 },
        { town: 'BEDOK', flatType: '4 ROOM', averagePrice: 498000, transactionCount: 900 },
        { town: 'TAMPINES', flatType: '4 ROOM', averagePrice: 470000, transactionCount: 700 },
      ],
    }),
  )
  await page.route('**/api/insights/wealth-index-by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', period: '2022', millionDollarCount: 1, totalTransactionCount: 2800, millionDollarSharePercent: 0.04 },
        { town: 'ANG MO KIO', period: '2023', millionDollarCount: 2, totalTransactionCount: 3000, millionDollarSharePercent: 0.07 },
        { town: 'BEDOK', period: '2022', millionDollarCount: 3, totalTransactionCount: 5000, millionDollarSharePercent: 0.06 },
        { town: 'BEDOK', period: '2023', millionDollarCount: 5, totalTransactionCount: 5230, millionDollarSharePercent: 0.1 },
        { town: 'TAMPINES', period: '2022', millionDollarCount: 4, totalTransactionCount: 3900, millionDollarSharePercent: 0.1 },
        { town: 'TAMPINES', period: '2023', millionDollarCount: 6, totalTransactionCount: 4100, millionDollarSharePercent: 0.15 },
      ],
    }),
  )
  await page.route('**/api/insights/by-town**', (route) =>
    route.fulfill({
      json: [
        { town: 'ANG MO KIO', averagePrice: 450000, transactionCount: 3000 },
        { town: 'BEDOK', averagePrice: 498000, transactionCount: 5230 },
        { town: 'TAMPINES', averagePrice: 520000, transactionCount: 4100 },
      ],
    }),
  )
}
