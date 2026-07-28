package sg.datasg.resale.insights;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import sg.datasg.resale.insights.dto.FlatTypeAveragePriceResponse;
import sg.datasg.resale.insights.dto.FlatTypePriceTrendPointResponse;
import sg.datasg.resale.insights.dto.PriceTrendPointResponse;
import sg.datasg.resale.insights.dto.RemainingLeasePriceResponse;
import sg.datasg.resale.insights.dto.SummaryStatsResponse;
import sg.datasg.resale.insights.dto.TownAveragePriceResponse;
import sg.datasg.resale.insights.dto.TownMaxPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownMinPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownPriceTrendPointResponse;

@Service
public class InsightsService {

    private static final Set<String> ALLOWED_GROUP_BY = Set.of("month", "year");

    private final InsightsRepository repository;

    public InsightsService(InsightsRepository repository) {
        this.repository = repository;
    }

    public SummaryStatsResponse summary(String town, String flatType) {
        SummaryStatsProjection projection = repository.summaryStats(town, flatType);
        return new SummaryStatsResponse(
            projection.getTotalTransactions(),
            round(projection.getAveragePrice()),
            round(projection.getMedianPrice()),
            projection.getMinPrice(),
            projection.getMaxPrice());
    }

    public List<PriceTrendPointResponse> priceTrend(String groupBy, String town, String flatType) {
        String unit = groupBy == null ? "month" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.priceTrend(unit, town, flatType).stream()
            .map(p -> new PriceTrendPointResponse(p.getPeriod(), round(p.getAveragePrice()), p.getTransactionCount()))
            .toList();
    }

    public List<TownPriceTrendPointResponse> priceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.priceTrendByTown(unit).stream()
            .map(p -> new TownPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .toList();
    }

    public List<FlatTypePriceTrendPointResponse> priceTrendByFlatType(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.priceTrendByFlatType(unit).stream()
            .map(p -> new FlatTypePriceTrendPointResponse(p.getFlatType(), p.getPeriod(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .toList();
    }

    public List<TownMaxPriceTrendPointResponse> maxPriceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.maxPriceTrendByTown(unit).stream()
            .map(p -> new TownMaxPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getMaxPrice()),
                p.getTransactionCount()))
            .toList();
    }

    public List<TownMinPriceTrendPointResponse> minPriceTrendByTown(String groupBy) {
        String unit = groupBy == null ? "year" : groupBy.toLowerCase();
        if (!ALLOWED_GROUP_BY.contains(unit)) {
            throw new IllegalArgumentException("Invalid groupBy '" + groupBy + "'. Allowed: " + ALLOWED_GROUP_BY);
        }
        return repository.minPriceTrendByTown(unit).stream()
            .map(p -> new TownMinPriceTrendPointResponse(p.getTown(), p.getPeriod(), round(p.getMinPrice()),
                p.getTransactionCount()))
            .toList();
    }

    public List<RemainingLeasePriceResponse> averagePriceByRemainingLease() {
        return repository.averagePriceByRemainingLease().stream()
            .map(p -> new RemainingLeasePriceResponse(p.getRemainingLeaseYears(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .toList();
    }

    public List<TownAveragePriceResponse> averagePriceByTown(String flatType, YearMonth fromMonth,
        YearMonth toMonth) {
        LocalDate from = fromMonth == null ? null : fromMonth.atDay(1);
        LocalDate to = toMonth == null ? null : toMonth.atEndOfMonth();
        return repository.averagePriceByTown(flatType, from, to).stream()
            .map(p -> new TownAveragePriceResponse(p.getTown(), round(p.getAveragePrice()), p.getTransactionCount()))
            .toList();
    }

    public List<FlatTypeAveragePriceResponse> averagePriceByFlatType(String town, YearMonth fromMonth,
        YearMonth toMonth) {
        LocalDate from = fromMonth == null ? null : fromMonth.atDay(1);
        LocalDate to = toMonth == null ? null : toMonth.atEndOfMonth();
        return repository.averagePriceByFlatType(town, from, to).stream()
            .map(p -> new FlatTypeAveragePriceResponse(p.getFlatType(), round(p.getAveragePrice()),
                p.getTransactionCount()))
            .toList();
    }

    private BigDecimal round(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
    }
}
