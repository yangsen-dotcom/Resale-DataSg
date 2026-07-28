import { fetchJson } from './client'
import type { PagedResponse, SortState, TransactionFilters, TransactionResponse } from './types'

export function getTransactions(
  filters: Partial<TransactionFilters>,
  page: number,
  size: number,
  sort: SortState,
): Promise<PagedResponse<TransactionResponse>> {
  return fetchJson<PagedResponse<TransactionResponse>>('/api/transactions', {
    town: filters.town,
    flatType: filters.flatType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    fromMonth: filters.fromMonth,
    toMonth: filters.toMonth,
    page,
    size,
    sort: `${sort.field},${sort.direction}`,
  })
}

export function getTowns(): Promise<string[]> {
  return fetchJson<string[]>('/api/transactions/towns')
}

export function getFlatTypes(): Promise<string[]> {
  return fetchJson<string[]>('/api/transactions/flat-types')
}
