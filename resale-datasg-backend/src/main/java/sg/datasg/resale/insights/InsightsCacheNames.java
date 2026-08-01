package sg.datasg.resale.insights;

import java.util.List;

/**
 * Single source of truth for the Redis cache names used by {@link InsightsService},
 * so {@code IngestionService} can evict all of them after a re-ingest without the
 * list drifting out of sync with the {@code @Cacheable} annotations.
 */
public final class InsightsCacheNames {

    public static final String SUMMARY = "insights-summary";
    public static final String PRICE_TREND = "insights-priceTrend";
    public static final String PRICE_TREND_BY_TOWN = "insights-priceTrendByTown";
    public static final String PRICE_TREND_BY_FLAT_TYPE = "insights-priceTrendByFlatType";
    public static final String MAX_PRICE_TREND_BY_TOWN = "insights-maxPriceTrendByTown";
    public static final String MIN_PRICE_TREND_BY_TOWN = "insights-minPriceTrendByTown";
    public static final String MEDIAN_PRICE_TREND_BY_TOWN = "insights-medianPriceTrendByTown";
    public static final String PRICE_PER_SQM_TREND_BY_TOWN = "insights-pricePerSqmTrendByTown";
    public static final String AREA_TREND = "insights-areaTrend";
    public static final String AVERAGE_PRICE_BY_REMAINING_LEASE = "insights-averagePriceByRemainingLease";
    public static final String AVERAGE_PRICE_BY_STOREY_RANGE = "insights-averagePriceByStoreyRange";
    public static final String AVERAGE_PRICE_BY_TOWN = "insights-averagePriceByTown";
    public static final String AVERAGE_PRICE_BY_FLAT_TYPE = "insights-averagePriceByFlatType";
    public static final String AVERAGE_PRICE_BY_TOWN_AND_FLAT_TYPE = "insights-averagePriceByTownAndFlatType";
    public static final String WEALTH_INDEX_BY_TOWN = "insights-wealthIndexByTown";

    public static final List<String> ALL = List.of(
        SUMMARY, PRICE_TREND, PRICE_TREND_BY_TOWN, PRICE_TREND_BY_FLAT_TYPE,
        MAX_PRICE_TREND_BY_TOWN, MIN_PRICE_TREND_BY_TOWN, MEDIAN_PRICE_TREND_BY_TOWN,
        PRICE_PER_SQM_TREND_BY_TOWN, AREA_TREND, AVERAGE_PRICE_BY_REMAINING_LEASE,
        AVERAGE_PRICE_BY_STOREY_RANGE, AVERAGE_PRICE_BY_TOWN, AVERAGE_PRICE_BY_FLAT_TYPE,
        AVERAGE_PRICE_BY_TOWN_AND_FLAT_TYPE, WEALTH_INDEX_BY_TOWN);

    private InsightsCacheNames() {
    }
}
