import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { StoreyRangePriceResponse } from '../../api/types'
import { CURRENCY_COMPACT, niceAxisTicks, thinIndices } from './chartUtils'
import styles from './StoreyRangeChart.module.css'
import '../../styles/chart-tokens.css'

const WIDTH = 900
const HEIGHT = 440
const MARGIN = { top: 16, right: 16, bottom: 32, left: 72 }
const TOOLTIP_WIDTH = 170
const TOOLTIP_OFFSET = 14

function tooltipPosition(pos: { x: number; y: number }, wrapper: HTMLDivElement | null): CSSProperties {
  const wrapperWidth = wrapper?.clientWidth ?? WIDTH
  const wrapperHeight = wrapper?.clientHeight ?? HEIGHT
  const overflowsRight = pos.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > wrapperWidth
  const left = overflowsRight ? pos.x - TOOLTIP_OFFSET - TOOLTIP_WIDTH : pos.x + TOOLTIP_OFFSET
  const top = Math.min(Math.max(pos.y - 20, 8), Math.max(wrapperHeight - 40, 8))
  return { left, top }
}

interface StoreyRangeChartProps {
  data: StoreyRangePriceResponse[]
  description?: string
}

export function StoreyRangeChart({ data, description }: StoreyRangeChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  const points = useMemo(() => [...data].sort((a, b) => a.storeyRange.localeCompare(b.storeyRange)), [data])
  const labelIndices = useMemo(() => new Set(thinIndices(points.length, 12)), [points.length])

  if (points.length === 0) {
    return <p className={styles.empty}>No storey range data available.</p>
  }

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom

  const prices = points.map((p) => p.averagePrice)
  const ticks = niceAxisTicks(Math.min(...prices), Math.max(...prices), 5)
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]

  const xFor = (index: number) => (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth)
  const yFor = (value: number) => plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.averagePrice)}`).join(' ')
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${plotHeight} L ${xFor(0)} ${plotHeight} Z`

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = points.length === 1 ? 0 : (event.clientX - rect.left) / rect.width
    const index = Math.round(ratio * (points.length - 1))
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1))

    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    if (wrapperRect) {
      setHoverPos({ x: event.clientX - wrapperRect.left, y: event.clientY - wrapperRect.top })
    }
  }

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} vizRoot`}>
      {description && <p className={styles.description}>{description}</p>}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Average resale price by storey range"
        className={styles.svg}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={0} x2={plotWidth} y1={yFor(tick)} y2={yFor(tick)} className={styles.gridline} />
              <text x={-8} y={yFor(tick)} className={styles.axisLabel} textAnchor="end" dominantBaseline="middle">
                {CURRENCY_COMPACT.format(tick)}
              </text>
            </g>
          ))}

          <line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} className={styles.baseline} />

          {points.map((point, index) => {
            if (!labelIndices.has(index)) {
              return null
            }
            const textAnchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'
            return (
              <text
                key={point.storeyRange}
                x={xFor(index)}
                y={plotHeight + 20}
                className={styles.axisLabel}
                textAnchor={textAnchor}
              >
                {point.storeyRange}
              </text>
            )
          })}

          <path d={areaPath} className={styles.area} />
          <path d={linePath} className={styles.line} fill="none" />

          {hoverIndex !== null && (
            <line x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={0} y2={plotHeight} className={styles.crosshair} />
          )}

          <rect
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => {
              setHoverIndex(null)
              setHoverPos(null)
            }}
          />
        </g>
      </svg>

      {hoveredPoint && hoverPos && (
        <div className={styles.tooltip} role="status" style={tooltipPosition(hoverPos, wrapperRef.current)}>
          <div className={styles.tooltipHeader}>Storey {hoveredPoint.storeyRange}</div>
          <div className={styles.tooltipPrice}>{CURRENCY_COMPACT.format(hoveredPoint.averagePrice)}</div>
          <div className={styles.tooltipCount}>{hoveredPoint.transactionCount.toLocaleString()} transactions</div>
        </div>
      )}
    </div>
  )
}
