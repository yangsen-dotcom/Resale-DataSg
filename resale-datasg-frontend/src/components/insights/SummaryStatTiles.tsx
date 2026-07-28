import type { SummaryStatsResponse } from '../../api/types'
import styles from './SummaryStatTiles.module.css'
import '../../styles/chart-tokens.css'

const COMPACT_CURRENCY = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const COMPACT_NUMBER = new Intl.NumberFormat('en-SG', { notation: 'compact', maximumFractionDigits: 1 })

interface Tile {
  label: string
  value: string
}

export function SummaryStatTiles({ stats }: { stats: SummaryStatsResponse }) {
  const tiles: Tile[] = [
    { label: 'Total transactions', value: COMPACT_NUMBER.format(stats.totalTransactions) },
    { label: 'Average price', value: COMPACT_CURRENCY.format(stats.averagePrice) },
    { label: 'Median price', value: COMPACT_CURRENCY.format(stats.medianPrice) },
    { label: 'Lowest price', value: COMPACT_CURRENCY.format(stats.minPrice) },
    { label: 'Highest price', value: COMPACT_CURRENCY.format(stats.maxPrice) },
  ]

  return (
    <div className={`${styles.row} vizRoot`}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <div className={styles.label}>{tile.label}</div>
          <div className={styles.value}>{tile.value}</div>
        </div>
      ))}
    </div>
  )
}
