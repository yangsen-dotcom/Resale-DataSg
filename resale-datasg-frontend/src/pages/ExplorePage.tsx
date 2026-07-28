import { useState } from 'react'
import { FilterPanel } from '../components/filters/FilterPanel'
import { TransactionTable } from '../components/table/TransactionTable'
import { Pagination } from '../components/table/Pagination'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'
import { useFilterState } from '../state/useFilterState'
import { useTransactions } from '../hooks/useTransactions'
import type { SortState } from '../api/types'

const PAGE_SIZE = 20

export function ExplorePage() {
  const { filters, setFilters } = useFilterState()
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<SortState>({ field: 'month', direction: 'desc' })

  const query = useTransactions(filters, page, PAGE_SIZE, sort)

  function handleFilterChange(next: Parameters<typeof setFilters>[0]) {
    setPage(0)
    setFilters(next)
  }

  function handleSortChange(field: SortState['field']) {
    setPage(0)
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'desc' },
    )
  }

  return (
    <div>
      <div className="pageHeader">
        <h1>Explore Resale Transactions</h1>
        <p className="pageSubtitle">
          Browse individual HDB resale flat transactions, filtered and sorted your way.
        </p>
      </div>

      <FilterPanel filters={filters} onChange={handleFilterChange} />

      {query.isLoading && <LoadingState label="Loading transactions…" />}
      {query.isError && (
        <ErrorState
          message="Failed to load transactions. Is the backend running?"
          onRetry={() => query.refetch()}
        />
      )}
      {query.isSuccess && query.data.content.length === 0 && (
        <EmptyState message="No transactions match these filters." />
      )}
      {query.isSuccess && query.data.content.length > 0 && (
        <>
          <TransactionTable transactions={query.data.content} sort={sort} onSortChange={handleSortChange} />
          <Pagination
            page={query.data.page}
            totalPages={query.data.totalPages}
            totalElements={query.data.totalElements}
            size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
