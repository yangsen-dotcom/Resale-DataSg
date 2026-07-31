package sg.datasg.resale.insights;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import sg.datasg.resale.insights.dto.AreaTrendPointResponse;
import sg.datasg.resale.insights.dto.FlatTypeAveragePriceResponse;
import sg.datasg.resale.insights.dto.FlatTypePriceTrendPointResponse;
import sg.datasg.resale.insights.dto.PriceTrendPointResponse;
import sg.datasg.resale.insights.dto.RemainingLeasePriceResponse;
import sg.datasg.resale.insights.dto.StoreyRangePriceResponse;
import sg.datasg.resale.insights.dto.SummaryStatsResponse;
import sg.datasg.resale.insights.dto.TownAveragePriceResponse;
import sg.datasg.resale.insights.dto.TownFlatTypeAveragePriceResponse;
import sg.datasg.resale.insights.dto.TownMaxPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownMedianPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownMinPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownPricePerSqmTrendPointResponse;
import sg.datasg.resale.insights.dto.TownPriceTrendPointResponse;

/**
 * The {@code @Cacheable} methods here deliberately collect into {@link ArrayList}
 * ({@code Collectors.toCollection(ArrayList::new)}) rather than {@code Stream.toList()}.
 * {@code CacheConfig}'s {@code GenericJackson2JsonRedisSerializer} embeds a type
 * marker on write only for types it considers ambiguous; {@code Stream.toList()}'s
 * concrete class doesn't get one, but a read (always targeting {@code Object.class})
 * still expects to find one, so every cache read for a {@code Stream.toList()} result
 * throws. {@code ArrayList} round-trips correctly, since it does get a marker.
 */
@Service
public class InsightsService {

    private static final Set<String> ALLOWED_GROUP_BY = Set.of("month", "year");

    private final InsightsRepository repository;

    public InsightsService(InsightsRepository repository) {
        this.repository = repository;
    }

    @Cacheable(InsightsCacheNames.SUMMARY)
    public SummaryStatsResponse summary(String town, String flatType) {
        SummaryStatsProjection projection = repository.summaryStats(town, flatType);
        return new SummaryStatsResponse(
            projection.getTotalTransactions(),
            round(projection.getAveragePrice()),
            round(projection.getMedianPrice()),
            projection.getMinPrice(),
            projection.getMaxPrice());
    }

    @Cacheable(InsightsCacheNames.PRICE_TREND)
    public List<PriceTrendPointResponse> priceTrend(String groupBy, String town, String flatType) {
        String unit = groupBy == null ? "month" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.priceTrend(unit, town, flatType).stream()
            .map(p -> new PriceTrendPointResponse(p.getPeriod(), round(p.getAveragePrice()), p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.PRICE_TREND_BY_TOWN)
    public List<TownPriceTrendPointResponse> priceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.priceTrendByTown(unit).stream()
            .map(p -> new TownPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.PRICE_TREND_BY_FLAT_TYPE)
    public List<FlatTypePriceTrendPointResponse> priceTrendByFlatType(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.priceTrendByFlatType(unit).stream()
            .map(p -> new FlatTypePriceTrendPointResponse(p.getFlatType(), p.getPeriod(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.MAX_PRICE_TREND_BY_TOWN)
    public List<TownMaxPriceTrendPointResponse> maxPriceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.maxPriceTrendByTown(unit).stream()
            .map(p -> new TownMaxPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getMaxPrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.MIN_PRICE_TREND_BY_TOWN)
    public List<TownMinPriceTrendPointResponse> minPriceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.minPriceTrendByTown(unit).stream()
            .map(p -> new TownMinPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getMinPrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.MEDIAN_PRICE_TREND_BY_TOWN)
    public List<TownMedianPriceTrendPointResponse> medianPriceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.medianPriceTrendByTown(unit).stream()
            .map(p -> new TownMedianPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getMedianPrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.PRICE_PER_SQM_TREND_BY_TOWN)
    public List<TownPricePerSqmTrendPointResponse> pricePerSqmTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.pricePerSqmTrendByTown(unit).stream()
            .map(p -> new TownPricePerSqmTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getPricePerSqm()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.AREA_TREND)
    public List<AreaTrendPointResponse> areaTrend(String groupBy) {
        String unit = groupBy == null ? "month" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.areaTrend(unit).stream()
            .map(p -> new AreaTrendPointResponse(p.getPeriod(), round(p.getMedianArea()), p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.AVERAGE_PRICE_BY_REMAINING_LEASE)
    public List<RemainingLeasePriceResponse> averagePriceByRemainingLease() {
        return repository.averagePriceByRemainingLease().stream()
            .map(p -> new RemainingLeasePriceResponse(p.getRemainingLeaseYears(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.AVERAGE_PRICE_BY_STOREY_RANGE)
    public List<StoreyRangePriceResponse> averagePriceByStoreyRange() {
        return repository.averagePriceByStoreyRange().stream()
            .map(p -> new StoreyRangePriceResponse(p.getStoreyRange(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.AVERAGE_PRICE_BY_TOWN_AND_FLAT_TYPE)
    public List<TownFlatTypeAveragePriceResponse> averagePriceByTownAndFlatType() {
        return repository.averagePriceByTownAndFlatType().stream()
            .map(p -> new TownFlatTypeAveragePriceResponse(p.getTown(), p.getFlatType(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.AVERAGE_PRICE_BY_TOWN)
    public List<TownAveragePriceResponse> averagePriceByTown(String flatType, YearMonth fromMonth,
        YearMonth toMonth) {
        LocalDate from = fromMonth == null ? null : fromMonth.atDay(1);
        LocalDate to = toMonth == null ? null : toMonth.atEndOfMonth();
        return repository.averagePriceByTown(flatType, from, to).stream()
            .map(p -> new TownAveragePriceResponse(p.getTown(), round(p.getAveragePrice()), p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(InsightsCacheNames.AVERAGE_PRICE_BY_FLAT_TYPE)
    public List<FlatTypeAveragePriceResponse> averagePriceByFlatType(String town, YearMonth fromMonth,
        YearMonth toMonth) {
        LocalDate from = fromMonth == null ? null : fromMonth.atDay(1);
        LocalDate to = toMonth == null ? null : toMonth.atEndOfMonth();
        return repository.averagePriceByFlatType(town, from, to).stream()
            .map(p -> new FlatTypeAveragePriceResponse(p.getFlatType(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    private BigDecimal round(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
    }
}
