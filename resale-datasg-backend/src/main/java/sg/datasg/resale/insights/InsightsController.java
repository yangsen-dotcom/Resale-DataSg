package sg.datasg.resale.insights;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.YearMonth;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import sg.datasg.resale.insights.dto.FlatTypeAveragePriceResponse;
import sg.datasg.resale.insights.dto.FlatTypePriceTrendPointResponse;
import sg.datasg.resale.insights.dto.PriceTrendPointResponse;
import sg.datasg.resale.insights.dto.RemainingLeasePriceResponse;
import sg.datasg.resale.insights.dto.SummaryStatsResponse;
import sg.datasg.resale.insights.dto.TownAveragePriceResponse;
import sg.datasg.resale.insights.dto.TownMaxPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownMinPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownPriceTrendPointResponse;

@RestController
@RequestMapping("/api/insights")
@Tag(name = "Insights", description = "Aggregate statistics and trends over HDB resale transactions")
public class InsightsController {

    private final InsightsService insightsService;

    public InsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @GetMapping("/summary")
    public SummaryStatsResponse summary(
        @RequestParam(required = false) String town,
        @RequestParam(required = false) String flatType) {
        return insightsService.summary(town, flatType);
    }

    @GetMapping("/price-trend")
    public List<PriceTrendPointResponse> priceTrend(
        @RequestParam(required = false, defaultValue = "month") String groupBy,
        @RequestParam(required = false) String town,
        @RequestParam(required = false) String flatType) {
        return insightsService.priceTrend(groupBy, town, flatType);
    }

    @GetMapping("/price-trend-by-town")
    public List<TownPriceTrendPointResponse> priceTrendByTown(
        @RequestParam(required = false, defaultValue = "year") String groupBy) {
        return insightsService.priceTrendByTown(groupBy);
    }

    @GetMapping("/price-trend-by-flat-type")
    public List<FlatTypePriceTrendPointResponse> priceTrendByFlatType(
        @RequestParam(required = false, defaultValue = "year") String groupBy) {
        return insightsService.priceTrendByFlatType(groupBy);
    }

    @GetMapping("/max-price-trend-by-town")
    public List<TownMaxPriceTrendPointResponse> maxPriceTrendByTown(
        @RequestParam(required = false, defaultValue = "year") String groupBy) {
        return insightsService.maxPriceTrendByTown(groupBy);
    }

    @GetMapping("/min-price-trend-by-town")
    public List<TownMinPriceTrendPointResponse> minPriceTrendByTown(
        @RequestParam(required = false, defaultValue = "year") String groupBy) {
        return insightsService.minPriceTrendByTown(groupBy);
    }

    @GetMapping("/average-price-by-remaining-lease")
    public List<RemainingLeasePriceResponse> averagePriceByRemainingLease() {
        return insightsService.averagePriceByRemainingLease();
    }

    @GetMapping("/by-town")
    public List<TownAveragePriceResponse> byTown(
        @RequestParam(required = false) String flatType,
        @RequestParam(required = false) YearMonth fromMonth,
        @RequestParam(required = false) YearMonth toMonth) {
        return insightsService.averagePriceByTown(flatType, fromMonth, toMonth);
    }

    @GetMapping("/by-flat-type")
    public List<FlatTypeAveragePriceResponse> byFlatType(
        @RequestParam(required = false) String town,
        @RequestParam(required = false) YearMonth fromMonth,
        @RequestParam(required = false) YearMonth toMonth) {
        return insightsService.averagePriceByFlatType(town, fromMonth, toMonth);
    }
}
