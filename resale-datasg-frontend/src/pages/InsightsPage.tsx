import { useEffect, useMemo, useState } from 'react'
import { ComparisonLegend } from '../components/insights/ComparisonLegend'
import { ComparisonLineChart, type ComparisonPoint } from '../components/insights/ComparisonLineChart'
import { RemainingLeaseChart } from '../components/insights/RemainingLeaseChart'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { useFlatTypes, useTowns } from '../hooks/useFilterOptions'
import {
  useAveragePriceByRemainingLease,
  useMaxPriceTrendByTown,
  useMinPriceTrendByTown,
  usePriceTrendByFlatType,
  usePriceTrendByTown,
} from '../hooks/useInsights'
import { buildColorScale } from '../components/insights/seriesColors'
import styles from './InsightsPage.module.css'

type Dimension = 'town' | 'flatType' | 'remainingLease'
type TownMetric = 'average' | 'highest' | 'lowest'

const TOWN_METRIC_LABEL: Record<TownMetric, string> = {
  average: 'Average Price',
  highest: 'Highest Price',
  lowest: 'Lowest Price',
}

const DIMENSION_LABEL: Record<Dimension, string> = {
  town: 'Towns',
  flatType: 'Flat Types',
  remainingLease: 'Remain Lease',
}

const DIMENSION_SINGULAR: Record<'town' | 'flatType', string> = {
  town: 'town',
  flatType: 'flat type',
}

export function InsightsPage() {
  const [dimension, setDimension] = useState<Dimension>('town')
  const [townMetric, setTownMetric] = useState<TownMetric>('average')
  const isCategorical = dimension === 'town' || dimension === 'flatType'
  const isTownHighest = dimension === 'town' && townMetric === 'highest'
  const isTownLowest = dimension === 'town' && townMetric === 'lowest'

  const townsQuery = useTowns()
  const flatTypesQuery = useFlatTypes()
  const townTrendQuery = usePriceTrendByTown('month', dimension === 'town' && townMetric === 'average')
  const townMaxTrendQuery = useMaxPriceTrendByTown('month', isTownHighest)
  const townMinTrendQuery = useMinPriceTrendByTown('month', isTownLowest)
  const flatTypeTrendQuery = usePriceTrendByFlatType('month', dimension === 'flatType')
  const remainingLeaseQuery = useAveragePriceByRemainingLease(dimension === 'remainingLease')

  const keysQuery = dimension === 'flatType' ? flatTypesQuery : townsQuery
  const trendQuery =
    dimension === 'flatType'
      ? flatTypeTrendQuery
      : isTownHighest
        ? townMaxTrendQuery
        : isTownLowest
          ? townMinTrendQuery
          : townTrendQuery

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isCategorical && keysQuery.data) {
      setVisibleKeys(new Set(keysQuery.data))
    }
  }, [isCategorical, keysQuery.data, dimension])

  const colorScale = useMemo(() => buildColorScale(keysQuery.data ?? []), [keysQuery.data])
  const colorForKey = (key: string) => colorScale.get(key) ?? '#888888'

  const chartData: ComparisonPoint[] = useMemo(() => {
    if (dimension === 'town') {
      if (townMetric === 'highest') {
        return townMaxTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.maxPrice })) ?? []
      }
      if (townMetric === 'lowest') {
        return townMinTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.minPrice })) ?? []
      }
      return townTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.averagePrice })) ?? []
    }
    if (dimension === 'flatType') {
      return flatTypeTrendQuery.data?.map((d) => ({ key: d.flatType, period: d.period, price: d.averagePrice })) ?? []
    }
    return []
  }, [
    dimension,
    townMetric,
    townTrendQuery.data,
    townMaxTrendQuery.data,
    townMinTrendQuery.data,
    flatTypeTrendQuery.data,
  ])

  function toggleKey(key: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const label = DIMENSION_LABEL[dimension]
  const metricWord = isTownHighest ? 'highest' : isTownLowest ? 'lowest' : 'average'
  const periodWord = 'month'

  const isLoading = isCategorical ? keysQuery.isLoading || trendQuery.isLoading : remainingLeaseQuery.isLoading
  const isReady = isCategorical ? keysQuery.isSuccess && trendQuery.isSuccess : remainingLeaseQuery.isSuccess

  return (
    <div>
      <div className="pageHeader">
        <h1>Resale Price Insights</h1>
        <p className="pageSubtitle">
          {isCategorical ? (
            <>
              Compare {metricWord} resale price by {periodWord} across {label.toLowerCase()} — click a{' '}
              {DIMENSION_SINGULAR[dimension === 'flatType' ? 'flatType' : 'town']} to show or hide it.
            </>
          ) : (
            'Compare average resale price against how many years remain on the flat’s lease.'
          )}
        </p>
      </div>

      {isLoading && <LoadingState label="Loading insights…" />}
      {isCategorical && keysQuery.isError && (
        <ErrorState message={`Failed to load ${label.toLowerCase()}.`} onRetry={() => keysQuery.refetch()} />
      )}
      {isCategorical && trendQuery.isError && (
        <ErrorState message="Failed to load price trends." onRetry={() => trendQuery.refetch()} />
      )}
      {!isCategorical && remainingLeaseQuery.isError && (
        <ErrorState message="Failed to load remaining lease data." onRetry={() => remainingLeaseQuery.refetch()} />
      )}

      {isReady && (
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          <nav className={styles.nav} aria-label="Insights dimension">
            {(Object.keys(DIMENSION_LABEL) as Dimension[]).map((option) => (
              <button
                key={option}
                type="button"
                className={option === dimension ? styles.navItemActive : styles.navItem}
                aria-pressed={option === dimension}
                onClick={() => setDimension(option)}
              >
                {DIMENSION_LABEL[option]}
              </button>
            ))}
          </nav>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {isCategorical ? (
              <>
                <ComparisonLineChart
                  data={chartData}
                  visibleKeys={visibleKeys}
                  colorForKey={colorForKey}
                  description={`Resale Prices: Comparison between ${label.toLowerCase()} — ${metricWord} resale price by ${periodWord}, for each selected ${DIMENSION_SINGULAR[dimension === 'flatType' ? 'flatType' : 'town']}.`}
                  ariaLabel={`${isTownHighest ? 'Highest' : isTownLowest ? 'Lowest' : 'Average'} resale price comparison between ${label.toLowerCase()}`}
                  yDomain={isTownHighest ? [400_000, 1_800_000] : isTownLowest ? [100_000, 1_400_000] : undefined}
                />
                <ComparisonLegend
                  title={label}
                  keys={keysQuery.data ?? []}
                  visibleKeys={visibleKeys}
                  colorForKey={colorForKey}
                  onToggleKey={toggleKey}
                  onShowAll={() => setVisibleKeys(new Set(keysQuery.data))}
                  onHideAll={() => setVisibleKeys(new Set())}
                />
                {dimension === 'town' && (
                  <div className={styles.metricToggle} role="group" aria-label="Town chart metric">
                    {(Object.keys(TOWN_METRIC_LABEL) as TownMetric[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={townMetric === option ? styles.metricButtonActive : styles.metricButton}
                        aria-pressed={townMetric === option}
                        onClick={() => setTownMetric(option)}
                      >
                        {TOWN_METRIC_LABEL[option]}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <RemainingLeaseChart
                data={remainingLeaseQuery.data ?? []}
                description="Resale Prices: Average price by remaining lease (years)."
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
