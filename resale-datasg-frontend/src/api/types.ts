export interface TransactionResponse {
  id: number
  month: string
  town: string
  flatType: string
  block: string
  streetName: string
  storeyRange: string
  floorAreaSqm: number
  flatModel: string
  leaseCommenceDate: number
  remainingLease: string
  resalePrice: number
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface SummaryStatsResponse {
  totalTransactions: number
  averagePrice: number
  medianPrice: number
  minPrice: number
  maxPrice: number
}

export interface PriceTrendPointResponse {
  period: string
  averagePrice: number
  transactionCount: number
}

export interface TownAveragePriceResponse {
  town: string
  averagePrice: number
  transactionCount: number
}

export interface FlatTypeAveragePriceResponse {
  flatType: string
  averagePrice: number
  transactionCount: number
}

export interface TransactionFilters {
  town: string[]
  flatType: string[]
  minPrice: string
  maxPrice: string
  fromMonth: string
  toMonth: string
}

export interface SortState {
  field: 'month' | 'resalePrice' | 'floorAreaSqm' | 'town'
  direction: 'asc' | 'desc'
}
