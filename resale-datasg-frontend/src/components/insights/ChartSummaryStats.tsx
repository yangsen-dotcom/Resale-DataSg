import styles from './ChartSummaryStats.module.css'

export interface SummaryStatItem {
  label: string
  value: string
  sublabel?: string
}

interface ChartSummaryStatsProps {
  items: SummaryStatItem[]
}

export function ChartSummaryStats({ items }: ChartSummaryStatsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={styles.row}>
      {items.map((item) => (
        <div key={item.label} className={styles.tile}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
          {item.sublabel && <span className={styles.sublabel}>{item.sublabel}</span>}
        </div>
      ))}
    </div>
  )
}
