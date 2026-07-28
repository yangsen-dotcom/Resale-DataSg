import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '../api/transactions'
import type { SortState, TransactionFilters } from '../api/types'

export function useTransactions(
  filters: TransactionFilters,
  page: number,
  size: number,
  sort: SortState,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['transactions', filters, page, size, sort],
    queryFn: () => getTransactions(filters, page, size, sort),
    placeholderData: (previousData) => previousData,
    enabled: options?.enabled ?? true,
  })
}
