import { useState, type PointerEvent } from 'react'
import type { PriceTrendPointResponse } from '../../api/types'
import { CURRENCY_COMPACT, niceTicks, thinIndices } from './chartUtils'
import styles from './PriceTrendChart.module.css'
import '../../styles/chart-tokens.css'

const WIDTH = 720
const HEIGHT = 320
const MARGIN = { top: 16, right: 16, bottom: 32, left: 64 }

interface PriceTrendChartProps {
  data: PriceTrendPointResponse[]
}

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (data.length === 0) {
    return <p className={styles.empty}>No trend data for this selection.</p>
  }

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const maxPrice = Math.max(...data.map((d) => d.averagePrice))
  const ticks = niceTicks(maxPrice, 4)
  const yMax = ticks[ticks.length - 1]

  const xFor = (index: number) => (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth)
  const yFor = (value: number) => plotHeight - (value / yMax) * plotHeight

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.averagePrice)}`).join(' ')
  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${plotHeight} L ${xFor(0)} ${plotHeight} Z`

  const labelIndices = new Set(thinIndices(data.length, 7))
  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const ratio = data.length === 1 ? 0 : relativeX / rect.width
    const index = Math.round(ratio * (data.length - 1))
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1))
  }

  return (
    <div className={`${styles.wrapper} vizRoot`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Average resale price trend over time"
        className={styles.svg}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                x2={plotWidth}
                y1={yFor(tick)}
                y2={yFor(tick)}
                className={styles.gridline}
              />
              <text x={-8} y={yFor(tick)} className={styles.axisLabel} textAnchor="end" dominantBaseline="middle">
                {CURRENCY_COMPACT.format(tick)}
              </text>
            </g>
          ))}

          <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} className={styles.baseline} />

          <path d={areaPath} className={styles.area} />
          <path d={linePath} className={styles.line} />

          {data.map((d, i) =>
            labelIndices.has(i) ? (
              <text
                key={d.period}
                x={xFor(i)}
                y={plotHeight + 20}
                className={styles.axisLabel}
                textAnchor="middle"
              >
                {d.period}
              </text>
            ) : null,
          )}

          {hovered && hoverIndex !== null && (
            <>
              <line
                x1={xFor(hoverIndex)}
                x2={xFor(hoverIndex)}
                y1={0}
                y2={plotHeight}
                className={styles.crosshair}
              />
              <circle cx={xFor(hoverIndex)} cy={yFor(hovered.averagePrice)} r={5} className={styles.endDot} />
            </>
          )}

          <rect
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </g>
      </svg>

      {hovered && (
        <div className={styles.tooltip} role="status">
          <strong>{CURRENCY_COMPACT.format(hovered.averagePrice)}</strong>
          <span>
            {hovered.period} · {hovered.transactionCount.toLocaleString()} transactions
          </span>
        </div>
      )}
    </div>
  )
}
