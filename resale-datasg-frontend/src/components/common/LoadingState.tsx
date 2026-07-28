import styles from './States.module.css'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className={styles.state}>
      <span className={styles.spinner} />
      <span className={styles.message}>{label}</span>
    </div>
  )
}
