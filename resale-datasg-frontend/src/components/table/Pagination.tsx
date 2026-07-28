import styles from './TransactionTable.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange }: PaginationProps) {
  const start = totalElements === 0 ? 0 : page * size + 1
  const end = Math.min((page + 1) * size, totalElements)

  return (
    <div className={styles.pagination}>
      <span>
        {start}–{end} of {totalElements.toLocaleString()} results
      </span>
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
