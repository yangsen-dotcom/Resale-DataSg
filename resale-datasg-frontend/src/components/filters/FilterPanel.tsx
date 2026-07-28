import { useEffect, useRef, useState } from 'react'
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

const THOUSANDS_FORMAT = new Intl.NumberFormat('en-US')

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

function stripToDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function formatThousands(raw: string): string {
  return raw ? THOUSANDS_FORMAT.format(Number(raw)) : ''
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

  useEffect(() => setMinPrice(filters.minPrice), [filters.minPrice])
  useEffect(() => setMaxPrice(filters.maxPrice), [filters.maxPrice])

  // Month/year pickers keep their own local state, independent of the composed
  // "YYYY-MM" filter value - a partial pick (only month, or only year) has
  // nowhere to live in that composed string, so deriving straight from it would
  // reset the other dropdown to its placeholder the instant one is picked.
  const [fromYear, setFromYear] = useState(() => splitMonthValue(filters.fromMonth).year)
  const [fromMonthPart, setFromMonthPart] = useState(() => splitMonthValue(filters.fromMonth).month)
  const [toYear, setToYear] = useState(() => splitMonthValue(filters.toMonth).year)
  const [toMonthPart, setToMonthPart] = useState(() => splitMonthValue(filters.toMonth).month)

  useEffect(() => {
    const parts = splitMonthValue(filters.fromMonth)
    setFromYear(parts.year)
    setFromMonthPart(parts.month)
  }, [filters.fromMonth])

  useEffect(() => {
    const parts = splitMonthValue(filters.toMonth)
    setToYear(parts.year)
    setToMonthPart(parts.month)
  }, [filters.toMonth])

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

  function handleFromMonthPartChange(part: 'year' | 'month', value: string) {
    const nextYear = part === 'year' ? value : fromYear
    const nextMonthPart = part === 'month' ? value : fromMonthPart
    setFromYear(nextYear)
    setFromMonthPart(nextMonthPart)
    const composed = composeMonthValue(nextYear, nextMonthPart)
    // Only push to the shared filter once a full "YYYY-MM" is formed, or to
    // clear a previously-complete value - never with a partial selection.
    if (composed || filters.fromMonth) {
      onChange({ fromMonth: composed })
    }
  }

  function handleToMonthPartChange(part: 'year' | 'month', value: string) {
    const nextYear = part === 'year' ? value : toYear
    const nextMonthPart = part === 'month' ? value : toMonthPart
    setToYear(nextYear)
    setToMonthPart(nextMonthPart)
    const composed = composeMonthValue(nextYear, nextMonthPart)
    if (composed || filters.toMonth) {
      onChange({ toMonth: composed })
    }
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
              type="text"
              inputMode="numeric"
              placeholder="Min"
              aria-label="Minimum price"
              value={formatThousands(minPrice)}
              onChange={(e) => {
                const raw = stripToDigits(e.target.value)
                setMinPrice(raw)
                debouncedChange({ minPrice: raw })
              }}
            />
            <span className={styles.rangeSeparator}>–</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Max"
              aria-label="Maximum price"
              value={formatThousands(maxPrice)}
              onChange={(e) => {
                const raw = stripToDigits(e.target.value)
                setMaxPrice(raw)
                debouncedChange({ maxPrice: raw })
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
                value={fromMonthPart}
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
                value={fromYear}
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
                value={toMonthPart}
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
                value={toYear}
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
