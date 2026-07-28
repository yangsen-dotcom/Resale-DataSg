import { useRef, useState } from 'react'
import { useFlatTypes, useTowns } from '../../hooks/useFilterOptions'
import type { TransactionFilters } from '../../api/types'
import styles from './FilterPanel.module.css'

const DEBOUNCE_MS = 400
const EMPTY_FILTERS: TransactionFilters = {
  town: [],
  flatType: [],
  minPrice: '',
  maxPrice: '',
  fromMonth: '',
  toMonth: '',
}

const DATASET_START_YEAR = 2017
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - DATASET_START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
)

const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

function splitMonthValue(value: string): { year: string; month: string } {
  if (!value) {
    return { year: '', month: '' }
  }
  const [year, month] = value.split('-')
  return { year: year ?? '', month: month ?? '' }
}

function composeMonthValue(year: string, month: string): string {
  return year && month ? `${year}-${month}` : ''
}

interface FilterPanelProps {
  filters: TransactionFilters
  onChange: (next: Partial<TransactionFilters>) => void
  showTownFilter?: boolean
  showFlatTypeFilter?: boolean
}

export function FilterPanel({
  filters,
  onChange,
  showTownFilter = true,
  showFlatTypeFilter = true,
}: FilterPanelProps) {
  const townsQuery = useTowns()
  const flatTypesQuery = useFlatTypes()

  const [minPrice, setMinPrice] = useState(filters.minPrice)
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function debouncedChange(next: Partial<TransactionFilters>) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => onChange(next), DEBOUNCE_MS)
  }

  function toggleValue(key: 'town' | 'flatType', value: string) {
    const current = filters[key]
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    onChange({ [key]: next })
  }

  const fromMonthParts = splitMonthValue(filters.fromMonth)
  const toMonthParts = splitMonthValue(filters.toMonth)

  function handleFromMonthPartChange(part: 'year' | 'month', value: string) {
    const next = { ...fromMonthParts, [part]: value }
    onChange({ fromMonth: composeMonthValue(next.year, next.month) })
  }

  function handleToMonthPartChange(part: 'year' | 'month', value: string) {
    const next = { ...toMonthParts, [part]: value }
    onChange({ toMonth: composeMonthValue(next.year, next.month) })
  }

  const hasActiveFilters =
    filters.town.length > 0 ||
    filters.flatType.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.fromMonth !== '' ||
    filters.toMonth !== ''

  function clearAll() {
    setMinPrice('')
    setMaxPrice('')
    onChange(EMPTY_FILTERS)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Filters</span>
        {hasActiveFilters && (
          <button type="button" className={styles.clearButton} onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className={styles.fields}>
        {showTownFilter && (
          <fieldset className={styles.fieldset}>
            <legend>Town</legend>
            <div className={styles.chipList}>
              {townsQuery.data?.map((town) => (
                <label key={town} className={styles.chip}>
                  <input
                    type="checkbox"
                    className={styles.chipInput}
                    checked={filters.town.includes(town)}
                    onChange={() => toggleValue('town', town)}
                  />
                  <span className={styles.chipLabel}>{town}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {showFlatTypeFilter && (
          <fieldset className={styles.fieldset}>
            <legend>Flat Type</legend>
            <div className={styles.chipList}>
              {flatTypesQuery.data?.map((flatType) => (
                <label key={flatType} className={styles.chip}>
                  <input
                    type="checkbox"
                    className={styles.chipInput}
                    checked={filters.flatType.includes(flatType)}
                    onChange={() => toggleValue('flatType', flatType)}
                  />
                  <span className={styles.chipLabel}>{flatType}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className={styles.fieldset}>
          <legend>Price Range (SGD)</legend>
          <div className={styles.rangeRow}>
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value)
                debouncedChange({ minPrice: e.target.value })
              }}
            />
            <span className={styles.rangeSeparator}>–</span>
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value)
                debouncedChange({ maxPrice: e.target.value })
              }}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Transaction Month</legend>
          <div className={styles.rangeRow}>
            <div className={styles.monthYearGroup}>
              <select
                aria-label="From month"
                value={fromMonthParts.month}
                onChange={(e) => handleFromMonthPartChange('month', e.target.value)}
              >
                <option value="">Month</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="From year"
                value={fromMonthParts.year}
                onChange={(e) => handleFromMonthPartChange('year', e.target.value)}
              >
                <option value="">Year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <span className={styles.rangeSeparator}>–</span>
            <div className={styles.monthYearGroup}>
              <select
                aria-label="To month"
                value={toMonthParts.month}
                onChange={(e) => handleToMonthPartChange('month', e.target.value)}
              >
                <option value="">Month</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="To year"
                value={toMonthParts.year}
                onChange={(e) => handleToMonthPartChange('year', e.target.value)}
              >
                <option value="">Year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  )
}
