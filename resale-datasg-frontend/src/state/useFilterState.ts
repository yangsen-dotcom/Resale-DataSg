import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TransactionFilters } from '../api/types'

const FILTER_KEYS = ['town', 'flatType', 'minPrice', 'maxPrice', 'fromMonth', 'toMonth'] as const

function parseFilters(params: URLSearchParams): TransactionFilters {
  return {
    town: params.getAll('town'),
    flatType: params.getAll('flatType'),
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    fromMonth: params.get('fromMonth') ?? '',
    toMonth: params.get('toMonth') ?? '',
  }
}

export function useFilterState(): {
  filters: TransactionFilters
  setFilters: (next: Partial<TransactionFilters>) => void
} {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  const setFilters = useCallback(
    (next: Partial<TransactionFilters>) => {
      setSearchParams(
        (prev) => {
          const merged = { ...parseFilters(prev), ...next }
          const params = new URLSearchParams(prev)
          for (const key of FILTER_KEYS) {
            params.delete(key)
          }
          for (const town of merged.town) {
            params.append('town', town)
          }
          for (const flatType of merged.flatType) {
            params.append('flatType', flatType)
          }
          if (merged.minPrice) params.set('minPrice', merged.minPrice)
          if (merged.maxPrice) params.set('maxPrice', merged.maxPrice)
          if (merged.fromMonth) params.set('fromMonth', merged.fromMonth)
          if (merged.toMonth) params.set('toMonth', merged.toMonth)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { filters, setFilters }
}
