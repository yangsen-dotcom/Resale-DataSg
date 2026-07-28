import { useCallback, useState } from 'react'
import type { TransactionFilters } from '../api/types'

const EMPTY_FILTERS: TransactionFilters = {
  town: [],
  flatType: [],
  minPrice: '',
  maxPrice: '',
  fromMonth: '',
  toMonth: '',
}

/**
 * Filter state kept in memory only (not reflected in the URL) - selecting a
 * filter just re-triggers the relevant API call and updates the page/section
 * in place, rather than navigating.
 */
export function useFilterState(): {
  filters: TransactionFilters
  setFilters: (next: Partial<TransactionFilters>) => void
} {
  const [filters, setFiltersState] = useState<TransactionFilters>(EMPTY_FILTERS)

  const setFilters = useCallback((next: Partial<TransactionFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }))
  }, [])

  return { filters, setFilters }
}
