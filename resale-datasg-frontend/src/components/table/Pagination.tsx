import styles from './TransactionTable.module.css'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange, onSizeChange }: PaginationProps) {
  const start = totalElements === 0 ? 0 : page * size + 1
  const end = Math.min((page + 1) * size, totalElements)

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationSummary}>
        <span>
          {start}–{end} of {totalElements.toLocaleString()} results
        </span>
        <label className={styles.pageSizeLabel}>
          Rows per page
          <select value={size} onChange={(e) => onSizeChange(Number(e.target.value))}>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          ← Previous
        </button>
        <span>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <button
          type="button"
          className={styles.paginationButton}
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
