import { useState, type PointerEvent } from 'react'
import type { FlatTypeAveragePriceResponse } from '../../api/types'
import { CURRENCY_COMPACT, niceTicks } from './chartUtils'
import styles from './BarComparisonChart.module.css'
import '../../styles/chart-tokens.css'

const WIDTH = 640
const HEIGHT = 300
const MARGIN = { top: 24, right: 12, bottom: 40, left: 64 }
const BAR_GAP = 12
const MAX_BAR_THICKNESS = 24

export function FlatTypeComparisonChart({ data }: { data: FlatTypeAveragePriceResponse[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (data.length === 0) {
    return <p className={styles.empty}>No flat type data for this selection.</p>
  }

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const maxPrice = Math.max(...data.map((d) => d.averagePrice))
  const ticks = niceTicks(maxPrice, 4)
  const yMax = ticks[ticks.length - 1]

  const slotWidth = plotWidth / data.length
  const barWidth = Math.min(slotWidth - BAR_GAP, MAX_BAR_THICKNESS)
  const heightFor = (value: number) => (value / yMax) * plotHeight
  const xFor = (index: number) => index * slotWidth + (slotWidth - barWidth) / 2

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const index = Math.floor(relativeX / slotWidth)
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1))
  }

  return (
    <div className={`${styles.wrapper} vizRoot`}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Average resale price by flat type" className={styles.svg}>
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={0} x2={plotWidth} y1={plotHeight - heightFor(tick)} y2={plotHeight - heightFor(tick)} className={styles.gridline} />
              <text x={-8} y={plotHeight - heightFor(tick)} textAnchor="end" dominantBaseline="middle" className={styles.axisLabel}>
                {CURRENCY_COMPACT.format(tick)}
              </text>
            </g>
          ))}
          <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} className={styles.baseline} />

          {data.map((row, i) => (
            <g key={row.flatType}>
              <rect
                x={xFor(i)}
                y={plotHeight - heightFor(row.averagePrice)}
                width={barWidth}
                height={heightFor(row.averagePrice)}
                rx={4}
                className={hoverIndex === i ? styles.barHover : styles.bar}
              />
              <text
                x={xFor(i) + barWidth / 2}
                y={plotHeight - heightFor(row.averagePrice) - 6}
                textAnchor="middle"
                className={styles.valueLabel}
              >
                {CURRENCY_COMPACT.format(row.averagePrice)}
              </text>
              <text x={xFor(i) + barWidth / 2} y={plotHeight + 16} textAnchor="middle" className={styles.axisLabel}>
                {row.flatType}
              </text>
              <rect
                x={i * slotWidth}
                y={0}
                width={slotWidth}
                height={plotHeight}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHoverIndex(null)}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
