import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:9090'

export const sampleTransaction = {
  id: 1,
  month: '2023-06',
  town: 'BEDOK',
  flatType: '4 ROOM',
  block: '123',
  streetName: 'BEDOK NORTH RD',
  storeyRange: '07 TO 09',
  floorAreaSqm: 92,
  flatModel: 'New Generation',
  leaseCommenceDate: 1980,
  remainingLease: '56 years 01 month',
  resalePrice: 520000,
}

export const handlers = [
  http.get(`${API_BASE_URL}/api/transactions`, () => {
    return HttpResponse.json({
      content: [sampleTransaction],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    })
  }),

  http.get(`${API_BASE_URL}/api/transactions/towns`, () => {
    return HttpResponse.json(['ANG MO KIO', 'BEDOK', 'TAMPINES'])
  }),

  http.get(`${API_BASE_URL}/api/transactions/flat-types`, () => {
    return HttpResponse.json(['2 ROOM', '3 ROOM', '4 ROOM'])
  }),

  http.get(`${API_BASE_URL}/api/transactions/blocks`, () => {
    return HttpResponse.json([
      { block: '123', streetName: 'BEDOK NORTH RD' },
      { block: '456', streetName: 'BEDOK SOUTH AVE' },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/price-trend-by-town`, () => {
    return HttpResponse.json([
      { town: 'ANG MO KIO', period: '2023', averagePrice: 450000, transactionCount: 3000 },
      { town: 'BEDOK', period: '2023', averagePrice: 498000, transactionCount: 5230 },
      { town: 'TAMPINES', period: '2023', averagePrice: 520000, transactionCount: 4100 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/price-trend-by-flat-type`, () => {
    return HttpResponse.json([
      { flatType: '2 ROOM', period: '2023', averagePrice: 300000, transactionCount: 800 },
      { flatType: '3 ROOM', period: '2023', averagePrice: 380000, transactionCount: 2100 },
      { flatType: '4 ROOM', period: '2023', averagePrice: 498000, transactionCount: 5230 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/max-price-trend-by-town`, () => {
    return HttpResponse.json([
      { town: 'ANG MO KIO', period: '2023', maxPrice: 760000, transactionCount: 3000 },
      { town: 'BEDOK', period: '2023', maxPrice: 880000, transactionCount: 5230 },
      { town: 'TAMPINES', period: '2023', maxPrice: 910000, transactionCount: 4100 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/min-price-trend-by-town`, () => {
    return HttpResponse.json([
      { town: 'ANG MO KIO', period: '2023', minPrice: 260000, transactionCount: 3000 },
      { town: 'BEDOK', period: '2023', minPrice: 280000, transactionCount: 5230 },
      { town: 'TAMPINES', period: '2023', minPrice: 300000, transactionCount: 4100 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/median-price-trend-by-town`, () => {
    return HttpResponse.json([
      { town: 'ANG MO KIO', period: '2023', medianPrice: 440000, transactionCount: 3000 },
      { town: 'BEDOK', period: '2023', medianPrice: 480000, transactionCount: 5230 },
      { town: 'TAMPINES', period: '2023', medianPrice: 500000, transactionCount: 4100 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/price-per-sqm-trend-by-town`, () => {
    return HttpResponse.json([
      { town: 'ANG MO KIO', period: '2023', pricePerSqm: 5100, transactionCount: 3000 },
      { town: 'BEDOK', period: '2023', pricePerSqm: 5400, transactionCount: 5230 },
      { town: 'TAMPINES', period: '2023', pricePerSqm: 5600, transactionCount: 4100 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/area-trend`, () => {
    return HttpResponse.json([
      { period: '2023-01', medianArea: 90, transactionCount: 2000 },
      { period: '2023-02', medianArea: 95, transactionCount: 1800 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/average-price-by-remaining-lease`, () => {
    return HttpResponse.json([
      { remainingLeaseYears: 60, averagePrice: 400000, transactionCount: 1200 },
      { remainingLeaseYears: 61, averagePrice: 420000, transactionCount: 900 },
      { remainingLeaseYears: 62, averagePrice: 440000, transactionCount: 700 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/by-town`, () => {
    return HttpResponse.json([{ town: 'BEDOK', averagePrice: 498000, transactionCount: 5230 }])
  }),
]
