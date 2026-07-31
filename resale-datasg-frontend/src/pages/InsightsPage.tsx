import { useEffect, useMemo, useState } from 'react'
import { AreaTrendChart } from '../components/insights/AreaTrendChart'
import { ChartSummaryStats, type SummaryStatItem } from '../components/insights/ChartSummaryStats'
import { ComparisonLegend } from '../components/insights/ComparisonLegend'
import { ComparisonLineChart, type ComparisonPoint } from '../components/insights/ComparisonLineChart'
import { RemainingLeaseChart } from '../components/insights/RemainingLeaseChart'
import { StoreyRangeChart } from '../components/insights/StoreyRangeChart'
import { TownFlatTypeHeatmap } from '../components/insights/TownFlatTypeHeatmap'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { useFlatTypes, useTowns } from '../hooks/useFilterOptions'
import {
  useAreaTrend,
  useAveragePriceByRemainingLease,
  useAveragePriceByStoreyRange,
  useAveragePriceByTownAndFlatType,
  useMaxPriceTrendByTown,
  useMedianPriceTrendByTown,
  useMinPriceTrendByTown,
  usePricePerSqmTrendByTown,
  usePriceTrendByFlatType,
  usePriceTrendByTown,
} from '../hooks/useInsights'
import { buildColorScale } from '../components/insights/seriesColors'
import { CURRENCY_COMPACT, NUMBER_COMPACT } from '../components/insights/chartUtils'
import styles from './InsightsPage.module.css'

type Dimension = 'town' | 'flatType' | 'remainingLease' | 'storeyRange' | 'townFlatType' | 'area'
type MetricOption = 'average' | 'highest' | 'lowest' | 'median' | 'count' | 'psm'

const METRIC_LABEL: Record<MetricOption, string> = {
  average: 'Average Price',
  highest: 'Highest Price',
  lowest: 'Lowest Price',
  median: 'Median Price',
  count: 'Transaction Count',
  psm: 'Price per SQM',
}

const METRIC_TEXT: Record<MetricOption, { phrase: string; ariaPrefix: string; chartPrefix: string }> = {
  average: { phrase: 'average resale price', ariaPrefix: 'Average resale price', chartPrefix: 'Resale Prices' },
  highest: { phrase: 'highest resale price', ariaPrefix: 'Highest resale price', chartPrefix: 'Resale Prices' },
  lowest: { phrase: 'lowest resale price', ariaPrefix: 'Lowest resale price', chartPrefix: 'Resale Prices' },
  median: { phrase: 'median resale price', ariaPrefix: 'Median resale price', chartPrefix: 'Resale Prices' },
  count: {
    phrase: 'number of transactions',
    ariaPrefix: 'Number of transactions',
    chartPrefix: 'Resale Transactions',
  },
  psm: {
    phrase: 'average price per square metre',
    ariaPrefix: 'Average price per square metre',
    chartPrefix: 'Resale Prices',
  },
}

const TOWN_METRICS: MetricOption[] = ['average', 'highest', 'lowest', 'median', 'count', 'psm']
const FLAT_TYPE_METRICS: MetricOption[] = ['average', 'count']

const DIMENSION_LABEL: Record<Dimension, string> = {
  town: 'Towns',
  flatType: 'Flat Types',
  remainingLease: 'Remain Lease',
  storeyRange: 'Storey Range',
  townFlatType: 'Town × Flat Type',
  area: 'Area',
}

const DIMENSION_SINGULAR: Record<'town' | 'flatType', string> = {
  town: 'town',
  flatType: 'flat type',
}

export function InsightsPage() {
  const [dimension, setDimension] = useState<Dimension>('town')
  const [townMetric, setTownMetric] = useState<MetricOption>('average')
  const [flatTypeMetric, setFlatTypeMetric] = useState<MetricOption>('average')
  const isCategorical = dimension === 'town' || dimension === 'flatType'
  const isTownHighest = dimension === 'town' && townMetric === 'highest'
  const isTownLowest = dimension === 'town' && townMetric === 'lowest'
  const isTownMedian = dimension === 'town' && townMetric === 'median'
  const isTownPsm = dimension === 'town' && townMetric === 'psm'
  const isCount =
    (dimension === 'town' && townMetric === 'count') || (dimension === 'flatType' && flatTypeMetric === 'count')
  const isRemainingLease = dimension === 'remainingLease'
  const isStoreyRange = dimension === 'storeyRange'
  const isHeatmap = dimension === 'townFlatType'
  const isArea = dimension === 'area'

  const townsQuery = useTowns()
  const flatTypesQuery = useFlatTypes()
  const townTrendQuery = usePriceTrendByTown(
    'month',
    dimension === 'town' && (townMetric === 'average' || townMetric === 'count'),
  )
  const townMaxTrendQuery = useMaxPriceTrendByTown('month', isTownHighest)
  const townMinTrendQuery = useMinPriceTrendByTown('month', isTownLowest)
  const townMedianTrendQuery = useMedianPriceTrendByTown('month', isTownMedian)
  const townPsmTrendQuery = usePricePerSqmTrendByTown('month', isTownPsm)
  const flatTypeTrendQuery = usePriceTrendByFlatType('month', dimension === 'flatType')
  const remainingLeaseQuery = useAveragePriceByRemainingLease(isRemainingLease)
  const storeyRangeQuery = useAveragePriceByStoreyRange(isStoreyRange)
  const heatmapQuery = useAveragePriceByTownAndFlatType(isHeatmap)
  const areaTrendQuery = useAreaTrend('month', isArea)

  const keysQuery = dimension === 'flatType' ? flatTypesQuery : townsQuery
  const trendQuery =
    dimension === 'flatType'
      ? flatTypeTrendQuery
      : isTownHighest
        ? townMaxTrendQuery
        : isTownLowest
          ? townMinTrendQuery
          : isTownMedian
            ? townMedianTrendQuery
            : isTownPsm
              ? townPsmTrendQuery
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
      if (townMetric === 'median') {
        return townMedianTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.medianPrice })) ?? []
      }
      if (townMetric === 'count') {
        return townTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.transactionCount })) ?? []
      }
      if (townMetric === 'psm') {
        return townPsmTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.pricePerSqm })) ?? []
      }
      return townTrendQuery.data?.map((d) => ({ key: d.town, period: d.period, price: d.averagePrice })) ?? []
    }
    if (dimension === 'flatType') {
      if (flatTypeMetric === 'count') {
        return (
          flatTypeTrendQuery.data?.map((d) => ({ key: d.flatType, period: d.period, price: d.transactionCount })) ??
          []
        )
      }
      return flatTypeTrendQuery.data?.map((d) => ({ key: d.flatType, period: d.period, price: d.averagePrice })) ?? []
    }
    return []
  }, [
    dimension,
    townMetric,
    flatTypeMetric,
    townTrendQuery.data,
    townMaxTrendQuery.data,
    townMinTrendQuery.data,
    townMedianTrendQuery.data,
    townPsmTrendQuery.data,
    flatTypeTrendQuery.data,
  ])

  const summaryItems: SummaryStatItem[] = useMemo(() => {
    if (isCategorical) {
      const visible = chartData.filter((d) => visibleKeys.has(d.key))
      if (visible.length === 0) {
        return []
      }
      const latestPeriod = visible.reduce((max, d) => (d.period > max ? d.period : max), visible[0].period)
      const latestPoints = visible.filter((d) => d.period === latestPeriod)
      const highest = latestPoints.reduce((a, b) => (b.price > a.price ? b : a))
      const lowest = latestPoints.reduce((a, b) => (b.price < a.price ? b : a))
      const average = latestPoints.reduce((sum, d) => sum + d.price, 0) / latestPoints.length
      const fmt = (value: number) => (isCount ? NUMBER_COMPACT.format(value) : CURRENCY_COMPACT.format(value))
      return [
        { label: 'Highest', value: fmt(highest.price), sublabel: `${highest.key} · ${latestPeriod}` },
        { label: 'Lowest', value: fmt(lowest.price), sublabel: `${lowest.key} · ${latestPeriod}` },
        {
          label: 'Average',
          value: fmt(average),
          sublabel: `across ${latestPoints.length} ${DIMENSION_LABEL[dimension].toLowerCase()}, ${latestPeriod}`,
        },
      ]
    }

    if (isArea) {
      const points = areaTrendQuery.data ?? []
      if (points.length === 0) {
        return []
      }
      const highest = points.reduce((a, b) => (b.medianArea > a.medianArea ? b : a))
      const lowest = points.reduce((a, b) => (b.medianArea < a.medianArea ? b : a))
      const average = points.reduce((sum, p) => sum + p.medianArea, 0) / points.length
      const fmt = (value: number) => `${NUMBER_COMPACT.format(value)} sqm`
      return [
        { label: 'Highest', value: fmt(highest.medianArea), sublabel: highest.period },
        { label: 'Lowest', value: fmt(lowest.medianArea), sublabel: lowest.period },
        { label: 'Average', value: fmt(average), sublabel: `across ${points.length} months` },
      ]
    }

    if (isStoreyRange) {
      const points = storeyRangeQuery.data ?? []
      if (points.length === 0) {
        return []
      }
      const highest = points.reduce((a, b) => (b.averagePrice > a.averagePrice ? b : a))
      const lowest = points.reduce((a, b) => (b.averagePrice < a.averagePrice ? b : a))
      const average = points.reduce((sum, p) => sum + p.averagePrice, 0) / points.length
      return [
        {
          label: 'Highest',
          value: CURRENCY_COMPACT.format(highest.averagePrice),
          sublabel: `Storey ${highest.storeyRange}`,
        },
        {
          label: 'Lowest',
          value: CURRENCY_COMPACT.format(lowest.averagePrice),
          sublabel: `Storey ${lowest.storeyRange}`,
        },
        {
          label: 'Average',
          value: CURRENCY_COMPACT.format(average),
          sublabel: `across ${points.length} storey ranges`,
        },
      ]
    }

    if (isHeatmap) {
      const points = heatmapQuery.data ?? []
      if (points.length === 0) {
        return []
      }
      const highest = points.reduce((a, b) => (b.averagePrice > a.averagePrice ? b : a))
      const lowest = points.reduce((a, b) => (b.averagePrice < a.averagePrice ? b : a))
      const average = points.reduce((sum, p) => sum + p.averagePrice, 0) / points.length
      return [
        {
          label: 'Highest',
          value: CURRENCY_COMPACT.format(highest.averagePrice),
          sublabel: `${highest.town} · ${highest.flatType}`,
        },
        {
          label: 'Lowest',
          value: CURRENCY_COMPACT.format(lowest.averagePrice),
          sublabel: `${lowest.town} · ${lowest.flatType}`,
        },
        {
          label: 'Average',
          value: CURRENCY_COMPACT.format(average),
          sublabel: `across ${points.length} town/flat type combinations`,
        },
      ]
    }

    const points = remainingLeaseQuery.data ?? []
    if (points.length === 0) {
      return []
    }
    const highest = points.reduce((a, b) => (b.averagePrice > a.averagePrice ? b : a))
    const lowest = points.reduce((a, b) => (b.averagePrice < a.averagePrice ? b : a))
    const average = points.reduce((sum, p) => sum + p.averagePrice, 0) / points.length
    return [
      {
        label: 'Highest',
        value: CURRENCY_COMPACT.format(highest.averagePrice),
        sublabel: `${highest.remainingLeaseYears} years remaining`,
      },
      {
        label: 'Lowest',
        value: CURRENCY_COMPACT.format(lowest.averagePrice),
        sublabel: `${lowest.remainingLeaseYears} years remaining`,
      },
      {
        label: 'Average',
        value: CURRENCY_COMPACT.format(average),
        sublabel: `across ${points.length} lease-year buckets`,
      },
    ]
  }, [
    isCategorical,
    chartData,
    visibleKeys,
    isCount,
    dimension,
    isArea,
    isStoreyRange,
    isHeatmap,
    remainingLeaseQuery.data,
    storeyRangeQuery.data,
    heatmapQuery.data,
    areaTrendQuery.data,
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
  const activeMetric: MetricOption =
    dimension === 'town' ? townMetric : dimension === 'flatType' ? flatTypeMetric : 'average'
  const metricText = METRIC_TEXT[activeMetric]
  const periodWord = 'month'

  const isLoading = isCategorical
    ? keysQuery.isLoading || trendQuery.isLoading
    : isArea
      ? areaTrendQuery.isLoading
      : isStoreyRange
        ? storeyRangeQuery.isLoading
        : isHeatmap
          ? heatmapQuery.isLoading
          : remainingLeaseQuery.isLoading
  const isReady = isCategorical
    ? keysQuery.isSuccess && trendQuery.isSuccess
    : isArea
      ? areaTrendQuery.isSuccess
      : isStoreyRange
        ? storeyRangeQuery.isSuccess
        : isHeatmap
          ? heatmapQuery.isSuccess
          : remainingLeaseQuery.isSuccess

  return (
    <div>
      <div className="pageHeader">
        <h1>Resale Price Insights</h1>
        <p className="pageSubtitle">
          {isCategorical ? (
            <>
              Compare {metricText.phrase} by {periodWord} across {label.toLowerCase()} — click a{' '}
              {DIMENSION_SINGULAR[dimension === 'flatType' ? 'flatType' : 'town']} to show or hide it.
            </>
          ) : isArea ? (
            'Track the median floor area (sqm) of resold flats by month.'
          ) : isStoreyRange ? (
            'Compare average resale price across storey ranges.'
          ) : isHeatmap ? (
            'Compare average resale price across every town and flat type combination.'
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
      {!isCategorical && isRemainingLease && remainingLeaseQuery.isError && (
        <ErrorState message="Failed to load remaining lease data." onRetry={() => remainingLeaseQuery.refetch()} />
      )}
      {!isCategorical && isStoreyRange && storeyRangeQuery.isError && (
        <ErrorState message="Failed to load storey range data." onRetry={() => storeyRangeQuery.refetch()} />
      )}
      {!isCategorical && isHeatmap && heatmapQuery.isError && (
        <ErrorState
          message="Failed to load town / flat type data."
          onRetry={() => heatmapQuery.refetch()}
        />
      )}
      {!isCategorical && isArea && areaTrendQuery.isError && (
        <ErrorState message="Failed to load area data." onRetry={() => areaTrendQuery.refetch()} />
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
            <ChartSummaryStats items={summaryItems} />
            {isCategorical ? (
              <>
                <ComparisonLineChart
                  data={chartData}
                  visibleKeys={visibleKeys}
                  colorForKey={colorForKey}
                  description={`${metricText.chartPrefix}: Comparison between ${label.toLowerCase()} — ${metricText.phrase} by ${periodWord}, for each selected ${DIMENSION_SINGULAR[dimension === 'flatType' ? 'flatType' : 'town']}.`}
                  ariaLabel={`${metricText.ariaPrefix} comparison between ${label.toLowerCase()}`}
                  yDomain={isTownHighest ? [400_000, 1_800_000] : isTownLowest ? [100_000, 1_400_000] : undefined}
                  valueFormat={isCount ? 'count' : 'currency'}
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
                {(dimension === 'town' || dimension === 'flatType') && (
                  <div className={styles.metricToggle} role="group" aria-label={`${label} chart metric`}>
                    {(dimension === 'town' ? TOWN_METRICS : FLAT_TYPE_METRICS).map((option) => {
                      const active = dimension === 'town' ? townMetric === option : flatTypeMetric === option
                      return (
                        <button
                          key={option}
                          type="button"
                          className={active ? styles.metricButtonActive : styles.metricButton}
                          aria-pressed={active}
                          onClick={() =>
                            dimension === 'town' ? setTownMetric(option) : setFlatTypeMetric(option)
                          }
                        >
                          {METRIC_LABEL[option]}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : isArea ? (
              <AreaTrendChart
                data={areaTrendQuery.data ?? []}
                description="Floor Area: Median floor area (sqm) by month, across all resale transactions."
              />
            ) : isStoreyRange ? (
              <StoreyRangeChart
                data={storeyRangeQuery.data ?? []}
                description="Resale Prices: Average price by storey range."
              />
            ) : isHeatmap ? (
              <TownFlatTypeHeatmap
                data={heatmapQuery.data ?? []}
                description="Resale Prices: Average price by town and flat type."
              />
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
