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

export interface TownPriceTrendPointResponse {
  town: string
  period: string
  averagePrice: number
  transactionCount: number
}

export interface TownMaxPriceTrendPointResponse {
  town: string
  period: string
  maxPrice: number
  transactionCount: number
}

export interface TownMinPriceTrendPointResponse {
  town: string
  period: string
  minPrice: number
  transactionCount: number
}

export interface TownMedianPriceTrendPointResponse {
  town: string
  period: string
  medianPrice: number
  transactionCount: number
}

export interface TownPricePerSqmTrendPointResponse {
  town: string
  period: string
  pricePerSqm: number
  transactionCount: number
}

export interface FlatTypePriceTrendPointResponse {
  flatType: string
  period: string
  averagePrice: number
  transactionCount: number
}

export interface RemainingLeasePriceResponse {
  remainingLeaseYears: number
  averagePrice: number
  transactionCount: number
}

export interface StoreyRangePriceResponse {
  storeyRange: string
  averagePrice: number
  transactionCount: number
}

export interface AreaTrendPointResponse {
  period: string
  medianArea: number
  transactionCount: number
}

export interface TownAveragePriceResponse {
  town: string
  averagePrice: number
  transactionCount: number
}

export interface WealthIndexResponse {
  town: string
  period: string
  millionDollarCount: number
  totalTransactionCount: number
  millionDollarSharePercent: number
}

export interface TownFlatTypeAveragePriceResponse {
  town: string
  flatType: string
  averagePrice: number
  transactionCount: number
}

export interface BlockOptionResponse {
  block: string
  streetName: string
}

export interface TransactionFilters {
  town: string[]
  flatType: string[]
  minPrice: string
  maxPrice: string
  fromMonth: string
  toMonth: string
  block?: string
}

export interface SortState {
  field:
    | 'month'
    | 'town'
    | 'flatType'
    | 'block'
    | 'streetName'
    | 'storeyRange'
    | 'floorAreaSqm'
    | 'remainingLease'
    | 'resalePrice'
  direction: 'asc' | 'desc'
}
