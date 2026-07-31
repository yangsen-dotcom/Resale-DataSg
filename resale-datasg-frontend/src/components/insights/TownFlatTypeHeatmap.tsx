import { useMemo, useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent } from 'react'
import type { TownFlatTypeAveragePriceResponse } from '../../api/types'
import { CURRENCY_COMPACT } from './chartUtils'
import styles from './TownFlatTypeHeatmap.module.css'
import '../../styles/chart-tokens.css'

const FLAT_TYPE_ORDER = ['1 ROOM', '2 ROOM', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE', 'MULTI-GENERATION']
const HEAT_STEPS = 13
const TOOLTIP_WIDTH = 190
const TOOLTIP_OFFSET = 10

interface TownFlatTypeHeatmapProps {
  data: TownFlatTypeAveragePriceResponse[]
  description?: string
}

interface HoverCell {
  town: string
  flatType: string
  cell: TownFlatTypeAveragePriceResponse | undefined
  x: number
  y: number
}

function tooltipPosition(x: number, y: number, wrapper: HTMLDivElement | null): CSSProperties {
  const wrapperWidth = wrapper?.clientWidth ?? 900
  const wrapperHeight = wrapper?.clientHeight ?? 500
  const overflowsRight = x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > wrapperWidth
  const left = overflowsRight ? x - TOOLTIP_OFFSET - TOOLTIP_WIDTH : x + TOOLTIP_OFFSET
  const top = Math.min(Math.max(y - 44, 8), Math.max(wrapperHeight - 64, 8))
  return { left, top }
}

function flatTypeSortKey(flatType: string): number {
  const index = FLAT_TYPE_ORDER.indexOf(flatType)
  return index === -1 ? FLAT_TYPE_ORDER.length : index
}

export function TownFlatTypeHeatmap({ data, description }: TownFlatTypeHeatmapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<HoverCell | null>(null)

  const { towns, flatTypes, cellFor, min, max } = useMemo(() => {
    const cellMap = new Map<string, TownFlatTypeAveragePriceResponse>()
    const townTotals = new Map<string, { sum: number; count: number }>()
    const flatTypeSet = new Set<string>()
    let min = Infinity
    let max = -Infinity

    for (const row of data) {
      cellMap.set(`${row.town}|${row.flatType}`, row)
      flatTypeSet.add(row.flatType)
      const totals = townTotals.get(row.town) ?? { sum: 0, count: 0 }
      totals.sum += row.averagePrice
      totals.count += 1
      townTotals.set(row.town, totals)
      min = Math.min(min, row.averagePrice)
      max = Math.max(max, row.averagePrice)
    }

    const towns = [...townTotals.keys()].sort((a, b) => {
      const avgA = townTotals.get(a)!.sum / townTotals.get(a)!.count
      const avgB = townTotals.get(b)!.sum / townTotals.get(b)!.count
      return avgB - avgA
    })
    const flatTypes = [...flatTypeSet].sort((a, b) => flatTypeSortKey(a) - flatTypeSortKey(b) || a.localeCompare(b))

    return {
      towns,
      flatTypes,
      cellFor: (town: string, flatType: string) => cellMap.get(`${town}|${flatType}`),
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 0,
    }
  }, [data])

  if (towns.length === 0 || flatTypes.length === 0) {
    return <p className={styles.empty}>No town / flat type data available.</p>
  }

  function heatIndex(value: number): number {
    if (max === min) {
      return Math.floor((HEAT_STEPS - 1) / 2)
    }
    const ratio = (value - min) / (max - min)
    return Math.min(HEAT_STEPS - 1, Math.max(0, Math.round(ratio * (HEAT_STEPS - 1))))
  }

  function showTooltip(event: MouseEvent<HTMLTableCellElement> | FocusEvent<HTMLTableCellElement>, town: string, flatType: string) {
    const cellRect = event.currentTarget.getBoundingClientRect()
    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    if (!wrapperRect) {
      return
    }
    setHover({
      town,
      flatType,
      cell: cellFor(town, flatType),
      x: cellRect.left - wrapperRect.left + cellRect.width / 2,
      y: cellRect.top - wrapperRect.top,
    })
  }

  function hideTooltip() {
    setHover(null)
  }

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} vizRoot`}>
      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className={styles.caption}>Average resale price by town and flat type</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.cornerHeader} />
              {flatTypes.map((flatType) => (
                <th key={flatType} scope="col" className={styles.colHeader}>
                  {flatType}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {towns.map((town) => (
              <tr key={town}>
                <th scope="row" className={styles.rowHeader}>
                  {town}
                </th>
                {flatTypes.map((flatType) => {
                  const cell = cellFor(town, flatType)
                  if (!cell) {
                    return (
                      <td
                        key={flatType}
                        className={styles.emptyCell}
                        tabIndex={0}
                        aria-label={`${town}, ${flatType}: no data`}
                        onMouseEnter={(event) => showTooltip(event, town, flatType)}
                        onFocus={(event) => showTooltip(event, town, flatType)}
                        onMouseLeave={hideTooltip}
                        onBlur={hideTooltip}
                      >
                        <span aria-hidden="true">–</span>
                      </td>
                    )
                  }
                  return (
                    <td
                      key={flatType}
                      className={styles.cell}
                      style={{ backgroundColor: `var(--heat-${heatIndex(cell.averagePrice)})` }}
                      tabIndex={0}
                      aria-label={`${town}, ${flatType}: average ${CURRENCY_COMPACT.format(cell.averagePrice)}, ${cell.transactionCount.toLocaleString()} transactions`}
                      onMouseEnter={(event) => showTooltip(event, town, flatType)}
                      onFocus={(event) => showTooltip(event, town, flatType)}
                      onMouseLeave={hideTooltip}
                      onBlur={hideTooltip}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.scale}>
        <span className={styles.scaleLabel}>{CURRENCY_COMPACT.format(min)}</span>
        <div className={styles.scaleGradient} aria-hidden="true" />
        <span className={styles.scaleLabel}>{CURRENCY_COMPACT.format(max)}</span>
      </div>

      {hover && (
        <div className={styles.tooltip} role="status" style={tooltipPosition(hover.x, hover.y, wrapperRef.current)}>
          <div className={styles.tooltipHeader}>
            {hover.town} · {hover.flatType}
          </div>
          {hover.cell ? (
            <>
              <div className={styles.tooltipPrice}>{CURRENCY_COMPACT.format(hover.cell.averagePrice)}</div>
              <div className={styles.tooltipCount}>{hover.cell.transactionCount.toLocaleString()} transactions</div>
            </>
          ) : (
            <div className={styles.tooltipCount}>No data</div>
          )}
        </div>
      )}
    </div>
  )
}
