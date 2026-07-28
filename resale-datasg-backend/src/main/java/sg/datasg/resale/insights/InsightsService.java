package sg.datasg.resale.insights;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import sg.datasg.resale.insights.dto.FlatTypeAveragePriceResponse;
import sg.datasg.resale.insights.dto.PriceTrendPointResponse;
import sg.datasg.resale.insights.dto.SummaryStatsResponse;
import sg.datasg.resale.insights.dto.TownAveragePriceResponse;

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
