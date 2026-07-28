import { useEffect, useState, type FormEvent } from 'react'
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

  const [pageInput, setPageInput] = useState(String(page + 1))

  useEffect(() => setPageInput(String(page + 1)), [page])

  function handleGoToPage(e: FormEvent) {
    e.preventDefault()
    const requested = Number(pageInput)
    if (!Number.isFinite(requested)) {
      setPageInput(String(page + 1))
      return
    }
    const clamped = Math.min(Math.max(Math.trunc(requested), 1), Math.max(totalPages, 1))
    setPageInput(String(clamped))
    onPageChange(clamped - 1)
  }

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
        <form className={styles.goToPageForm} onSubmit={handleGoToPage}>
          <label htmlFor="goToPageInput">Go to page</label>
          <input
            id="goToPageInput"
            type="number"
            min={1}
            max={Math.max(totalPages, 1)}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
          />
          <button type="submit" className={styles.paginationButton}>
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
