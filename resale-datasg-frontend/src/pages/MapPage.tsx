import { useState } from 'react'
import type { SortState, TransactionFilters } from '../api/types'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { TownMap } from '../components/map/TownMap'
import { Pagination } from '../components/table/Pagination'
import { TransactionTable } from '../components/table/TransactionTable'
import { useBlocks, useTowns } from '../hooks/useFilterOptions'
import { useByTown } from '../hooks/useInsights'
import { useTransactions } from '../hooks/useTransactions'

const PAGE_SIZE = 20

export function MapPage() {
  const [selectedTown, setSelectedTown] = useState<string | undefined>(undefined)
  const [selectedBlock, setSelectedBlock] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [sort, setSort] = useState<SortState>({ field: 'month', direction: 'desc' })

  const townsQuery = useTowns()
  const townStatsQuery = useByTown({})
  const blocksQuery = useBlocks(selectedTown)

  const filters: TransactionFilters = {
    town: selectedTown ? [selectedTown] : [],
    flatType: [],
    minPrice: '',
    maxPrice: '',
    fromMonth: '',
    toMonth: '',
    block: selectedBlock,
  }
  const transactionsQuery = useTransactions(filters, page, pageSize, sort, {
    enabled: Boolean(selectedTown && selectedBlock),
  })

  function handleSelectTown(town: string) {
    setSelectedTown(town)
    setSelectedBlock(undefined)
    setPage(0)
  }

  function handleSelectBlock(block: string) {
    setSelectedBlock(block || undefined)
    setPage(0)
  }

  function handleSortChange(field: SortState['field']) {
    setPage(0)
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'desc' },
    )
  }

  function handlePageSizeChange(size: number) {
    setPage(0)
    setPageSize(size)
  }

  return (
    <div>
      <div className="pageHeader">
        <h1>Map</h1>
        <p className="pageSubtitle">
          Click a town on the map (or pick one below) to see its blocks, then pick a block to see its transactions.
          </p>
      </div>

      {townsQuery.isLoading && <LoadingState label="Loading towns…" />}
      {townsQuery.isError && (
        <ErrorState message="Failed to load towns." onRetry={() => townsQuery.refetch()} />
      )}

      {townsQuery.isSuccess && (
        <>
          <TownMap
            towns={townsQuery.data}
            townStats={townStatsQuery.data ?? []}
            selectedTown={selectedTown}
            onSelectTown={handleSelectTown}
          />

          <div className="section" style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <label>
                Town{' '}
                <select
                  aria-label="Town"
                  value={selectedTown ?? ''}
                  onChange={(e) => handleSelectTown(e.target.value)}
                >
                  <option value="">Select a town</option>
                  {townsQuery.data.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
              </label>

              {selectedTown && (
                <label>
                  Block{' '}
                  <select
                    aria-label="Block"
                    value={selectedBlock ?? ''}
                    onChange={(e) => handleSelectBlock(e.target.value)}
                  >
                    <option value="">Select a block</option>
                    {blocksQuery.data?.map((option) => (
                      <option key={`${option.block}-${option.streetName}`} value={option.block}>
                        {option.block} – {option.streetName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        </>
      )}

      {selectedTown && selectedBlock && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <h2>
            Transactions at Block {selectedBlock}, {selectedTown}
          </h2>
          {transactionsQuery.isLoading && <LoadingState label="Loading transactions…" />}
          {transactionsQuery.isError && (
            <ErrorState message="Failed to load transactions." onRetry={() => transactionsQuery.refetch()} />
          )}
          {transactionsQuery.isSuccess && transactionsQuery.data.content.length === 0 && (
            <EmptyState message="No transactions found for this block." />
          )}
          {transactionsQuery.isSuccess && transactionsQuery.data.content.length > 0 && (
            <>
              <TransactionTable
                transactions={transactionsQuery.data.content}
                sort={sort}
                onSortChange={handleSortChange}
              />
              <Pagination
                page={transactionsQuery.data.page}
                totalPages={transactionsQuery.data.totalPages}
                totalElements={transactionsQuery.data.totalElements}
                size={pageSize}
                onPageChange={setPage}
                onSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
