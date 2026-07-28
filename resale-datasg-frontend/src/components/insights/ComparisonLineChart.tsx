import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { CURRENCY_COMPACT, fixedRangeTicks, niceAxisTicks } from './chartUtils'
import styles from './ComparisonLineChart.module.css'
import '../../styles/chart-tokens.css'

const WIDTH = 900
const HEIGHT = 440
const MARGIN = { top: 16, right: 16, bottom: 32, left: 72 }
const TOOLTIP_WIDTH = 210
const TOOLTIP_OFFSET = 14

function tooltipPosition(pos: { x: number; y: number }, wrapper: HTMLDivElement | null): CSSProperties {
  const wrapperWidth = wrapper?.clientWidth ?? WIDTH
  const wrapperHeight = wrapper?.clientHeight ?? HEIGHT
  const overflowsRight = pos.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > wrapperWidth
  const left = overflowsRight ? pos.x - TOOLTIP_OFFSET - TOOLTIP_WIDTH : pos.x + TOOLTIP_OFFSET
  const top = Math.min(Math.max(pos.y - 20, 8), Math.max(wrapperHeight - 40, 8))
  return { left, top }
}

export interface ComparisonPoint {
  key: string
  period: string
  price: number
}

interface ComparisonLineChartProps {
  data: ComparisonPoint[]
  visibleKeys: Set<string>
  colorForKey: (key: string) => string
  description?: string
  ariaLabel: string
  /** Fixed [min, max] for the Y-axis instead of deriving it from the visible data. */
  yDomain?: [number, number]
}

export function ComparisonLineChart({
  data,
  visibleKeys,
  colorForKey,
  description,
  ariaLabel,
  yDomain,
}: ComparisonLineChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  const periods = useMemo(() => Array.from(new Set(data.map((d) => d.period))).sort(), [data])

  const yearTicks = useMemo(() => {
    const marks: { index: number; year: string }[] = []
    let lastYear = ''
    periods.forEach((period, index) => {
      const year = period.slice(0, 4)
      if (year !== lastYear) {
        marks.push({ index, year })
        lastYear = year
      }
    })
    return marks
  }, [periods])

  const seriesByKey = useMemo(() => {
    const map = new Map<string, Map<string, ComparisonPoint>>()
    for (const point of data) {
      if (!map.has(point.key)) {
        map.set(point.key, new Map())
      }
      map.get(point.key)?.set(point.period, point)
    }
    return map
  }, [data])

  if (periods.length === 0) {
    return <p className={styles.empty}>No trend data available.</p>
  }

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom

  const visibleKeyList = Array.from(visibleKeys).filter((key) => seriesByKey.has(key))
  const visibleData = data.filter((d) => visibleKeys.has(d.key))
  const pricesInView = (visibleData.length > 0 ? visibleData : data).map((d) => d.price)
  const ticks = yDomain
    ? fixedRangeTicks(yDomain[0], yDomain[1])
    : niceAxisTicks(Math.min(...pricesInView), Math.max(...pricesInView), 5)
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]

  const xFor = (index: number) => (periods.length === 1 ? plotWidth / 2 : (index / (periods.length - 1)) * plotWidth)
  const yFor = (value: number) => {
    const y = plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight
    return yDomain ? Math.min(Math.max(y, 0), plotHeight) : y
  }

  function pathFor(key: string): string {
    const seriesData = seriesByKey.get(key)
    if (!seriesData) {
      return ''
    }
    let path = ''
    periods.forEach((period, index) => {
      const point = seriesData.get(period)
      if (!point) {
        return
      }
      path += `${path ? 'L' : 'M'} ${xFor(index)} ${yFor(point.price)} `
    })
    return path.trim()
  }

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = periods.length === 1 ? 0 : (event.clientX - rect.left) / rect.width
    const index = Math.round(ratio * (periods.length - 1))
    setHoverIndex(Math.min(Math.max(index, 0), periods.length - 1))

    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    if (wrapperRect) {
      setHoverPos({ x: event.clientX - wrapperRect.left, y: event.clientY - wrapperRect.top })
    }
  }

  const hoveredPeriod = hoverIndex !== null ? periods[hoverIndex] : null
  const hoveredRows = hoveredPeriod
    ? visibleKeyList
        .map((key) => ({ key, point: seriesByKey.get(key)?.get(hoveredPeriod) }))
        .filter((row): row is { key: string; point: ComparisonPoint } => Boolean(row.point))
        .sort((a, b) => b.point.price - a.point.price)
    : []

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} vizRoot`}>
      {description && <p className={styles.description}>{description}</p>}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel} className={styles.svg}>
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

          {yearTicks.map(({ index, year }) => (
            <text key={year} x={xFor(index)} y={plotHeight + 20} className={styles.axisLabel} textAnchor="middle">
              {year}
            </text>
          ))}

          {visibleKeyList.map((key) => (
            <path key={key} d={pathFor(key)} stroke={colorForKey(key)} className={styles.line} fill="none" />
          ))}

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

      {hoveredPeriod && hoveredRows.length > 0 && hoverPos && (
        <div className={styles.tooltip} role="status" style={tooltipPosition(hoverPos, wrapperRef.current)}>
          <div className={styles.tooltipHeader}>{hoveredPeriod}</div>
          <div className={styles.tooltipRows}>
            {hoveredRows.map(({ key, point }) => (
              <div key={key} className={styles.tooltipRow}>
                <span className={styles.tooltipSwatch} style={{ background: colorForKey(key) }} />
                <span className={styles.tooltipTown}>{key}</span>
                <strong>{CURRENCY_COMPACT.format(point.price)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
