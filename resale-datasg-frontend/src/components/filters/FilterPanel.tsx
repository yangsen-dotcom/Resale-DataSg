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
  const [fromMonth, setFromMonth] = useState(filters.fromMonth)
  const [toMonth, setToMonth] = useState(filters.toMonth)

  useEffect(() => setMinPrice(filters.minPrice), [filters.minPrice])
  useEffect(() => setMaxPrice(filters.maxPrice), [filters.maxPrice])
  useEffect(() => setFromMonth(filters.fromMonth), [filters.fromMonth])
  useEffect(() => setToMonth(filters.toMonth), [filters.toMonth])

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
    setFromMonth('')
    setToMonth('')
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
            <input
              type="month"
              aria-label="From month"
              value={fromMonth}
              onChange={(e) => {
                setFromMonth(e.target.value)
                debouncedChange({ fromMonth: e.target.value })
              }}
            />
            <span className={styles.rangeSeparator}>–</span>
            <input
              type="month"
              aria-label="To month"
              value={toMonth}
              onChange={(e) => {
                setToMonth(e.target.value)
                debouncedChange({ toMonth: e.target.value })
              }}
            />
          </div>
        </fieldset>
      </div>
    </div>
  )
}
