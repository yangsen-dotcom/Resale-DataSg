import { FilterPanel } from '../components/filters/FilterPanel'
import { SummaryStatTiles } from '../components/insights/SummaryStatTiles'
import { PriceTrendChart } from '../components/insights/PriceTrendChart'
import { TownComparisonChart } from '../components/insights/TownComparisonChart'
import { FlatTypeComparisonChart } from '../components/insights/FlatTypeComparisonChart'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { useFilterState } from '../state/useFilterState'
import { useByFlatType, useByTown, usePriceTrend, useSummary } from '../hooks/useInsights'

export function InsightsPage() {
  const { filters, setFilters } = useFilterState()
  const town = filters.town[0]
  const flatType = filters.flatType[0]

  const summaryQuery = useSummary({ town, flatType })
  const trendQuery = usePriceTrend('month', { town, flatType })
  const byTownQuery = useByTown({ flatType, fromMonth: filters.fromMonth, toMonth: filters.toMonth })
  const byFlatTypeQuery = useByFlatType({ town, fromMonth: filters.fromMonth, toMonth: filters.toMonth })

  return (
    <div>
      <div className="pageHeader">
        <h1>Resale Price Insights</h1>
        <p className="pageSubtitle">Aggregate stats and trends across HDB resale transactions.</p>
      </div>

      <FilterPanel filters={filters} onChange={setFilters} />
      <p className="hint">Insights use the first selected town/flat type filter, if any.</p>

      {summaryQuery.isLoading && <LoadingState label="Loading summary…" />}
      {summaryQuery.isError && (
        <ErrorState message="Failed to load summary stats." onRetry={() => summaryQuery.refetch()} />
      )}
      {summaryQuery.isSuccess && <SummaryStatTiles stats={summaryQuery.data} />}

      <section className="chartSection">
        <h2>Price Trend</h2>
        {trendQuery.isLoading && <LoadingState label="Loading trend…" />}
        {trendQuery.isError && <ErrorState message="Failed to load price trend." onRetry={() => trendQuery.refetch()} />}
        {trendQuery.isSuccess && <PriceTrendChart data={trendQuery.data} />}
      </section>

      <section className="chartSection">
        <h2>Average Price by Town</h2>
        {byTownQuery.isLoading && <LoadingState label="Loading towns…" />}
        {byTownQuery.isError && <ErrorState message="Failed to load town comparison." onRetry={() => byTownQuery.refetch()} />}
        {byTownQuery.isSuccess && <TownComparisonChart data={byTownQuery.data} />}
      </section>

      <section className="chartSection">
        <h2>Average Price by Flat Type</h2>
        {byFlatTypeQuery.isLoading && <LoadingState label="Loading flat types…" />}
        {byFlatTypeQuery.isError && (
          <ErrorState message="Failed to load flat type comparison." onRetry={() => byFlatTypeQuery.refetch()} />
        )}
        {byFlatTypeQuery.isSuccess && <FlatTypeComparisonChart data={byFlatTypeQuery.data} />}
      </section>
    </div>
  )
}
