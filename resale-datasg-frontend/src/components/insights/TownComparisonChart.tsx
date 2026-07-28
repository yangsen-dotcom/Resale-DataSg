import { useState, type PointerEvent } from 'react'
import type { TownAveragePriceResponse } from '../../api/types'
import { CURRENCY_COMPACT, niceTicks } from './chartUtils'
import styles from './BarComparisonChart.module.css'
import '../../styles/chart-tokens.css'

const WIDTH = 720
const MARGIN = { top: 8, right: 64, bottom: 24, left: 120 }
const BAR_HEIGHT = 20
const BAR_GAP = 6
const TOP_N = 15

export function TownComparisonChart({ data }: { data: TownAveragePriceResponse[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const rows = data.slice(0, TOP_N)

  if (rows.length === 0) {
    return <p className={styles.empty}>No town data for this selection.</p>
  }

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = rows.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP
  const height = plotHeight + MARGIN.top + MARGIN.bottom
  const maxPrice = Math.max(...rows.map((r) => r.averagePrice))
  const ticks = niceTicks(maxPrice, 4)
  const xMax = ticks[ticks.length - 1]

  const widthFor = (value: number) => (value / xMax) * plotWidth
  const yFor = (index: number) => index * (BAR_HEIGHT + BAR_GAP)

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeY = event.clientY - rect.top
    const index = Math.floor(relativeY / (BAR_HEIGHT + BAR_GAP))
    setHoverIndex(Math.min(Math.max(index, 0), rows.length - 1))
  }

  return (
    <div className={`${styles.wrapper} vizRoot`}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="Average resale price by town" className={styles.svg}>
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={widthFor(tick)}
              x2={widthFor(tick)}
              y1={0}
              y2={plotHeight}
              className={styles.gridline}
            />
          ))}
          <line x1={0} x2={0} y1={0} y2={plotHeight} className={styles.baseline} />

          {rows.map((row, i) => (
            <g key={row.town}>
              <text x={-8} y={yFor(i) + BAR_HEIGHT / 2} textAnchor="end" dominantBaseline="middle" className={styles.axisLabel}>
                {row.town}
              </text>
              <rect
                x={0}
                y={yFor(i)}
                width={Math.max(widthFor(row.averagePrice), 2)}
                height={BAR_HEIGHT}
                rx={4}
                className={hoverIndex === i ? styles.barHover : styles.bar}
              />
              <text
                x={widthFor(row.averagePrice) + 6}
                y={yFor(i) + BAR_HEIGHT / 2}
                dominantBaseline="middle"
                className={styles.valueLabel}
              >
                {CURRENCY_COMPACT.format(row.averagePrice)}
              </text>
              <rect
                x={0}
                y={yFor(i)}
                width={plotWidth}
                height={BAR_HEIGHT}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHoverIndex(null)}
              />
            </g>
          ))}
        </g>
      </svg>
      {data.length > TOP_N && (
        <p className={styles.note}>
          Showing top {TOP_N} of {data.length} towns by average price.
        </p>
      )}
    </div>
  )
}
