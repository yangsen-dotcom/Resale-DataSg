import styles from './States.module.css'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className={styles.state}>
      <svg
        className={styles.iconDanger}
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9.25" />
        <line x1="12" y1="7.5" x2="12" y2="13" />
        <circle cx="12" cy="16.25" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
