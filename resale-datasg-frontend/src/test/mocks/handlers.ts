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

  http.get(`${API_BASE_URL}/api/insights/summary`, () => {
    return HttpResponse.json({
      totalTransactions: 193456,
      averagePrice: 512340.55,
      medianPrice: 495000,
      minPrice: 140000,
      maxPrice: 1580000,
    })
  }),

  http.get(`${API_BASE_URL}/api/insights/price-trend`, () => {
    return HttpResponse.json([
      { period: '2023-05', averagePrice: 500000, transactionCount: 800 },
      { period: '2023-06', averagePrice: 512000, transactionCount: 812 },
    ])
  }),

  http.get(`${API_BASE_URL}/api/insights/by-town`, () => {
    return HttpResponse.json([{ town: 'BEDOK', averagePrice: 498000, transactionCount: 5230 }])
  }),

  http.get(`${API_BASE_URL}/api/insights/by-flat-type`, () => {
    return HttpResponse.json([{ flatType: '4 ROOM', averagePrice: 480000, transactionCount: 60210 }])
  }),
]
