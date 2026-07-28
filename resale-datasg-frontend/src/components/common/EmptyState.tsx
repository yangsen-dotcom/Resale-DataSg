import styles from './States.module.css'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.state}>
      <svg
        className={styles.icon}
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <line x1="15.3" y1="15.3" x2="20.5" y2="20.5" />
      </svg>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
