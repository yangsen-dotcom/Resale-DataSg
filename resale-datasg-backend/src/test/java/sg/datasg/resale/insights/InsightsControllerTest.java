package sg.datasg.resale.insights;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import sg.datasg.resale.insights.dto.AreaTrendPointResponse;
import sg.datasg.resale.insights.dto.FlatTypePriceTrendPointResponse;
import sg.datasg.resale.insights.dto.RemainingLeasePriceResponse;
import sg.datasg.resale.insights.dto.SummaryStatsResponse;
import sg.datasg.resale.insights.dto.TownAveragePriceResponse;
import sg.datasg.resale.insights.dto.TownMaxPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownMedianPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownMinPriceTrendPointResponse;
import sg.datasg.resale.insights.dto.TownPricePerSqmTrendPointResponse;
import sg.datasg.resale.insights.dto.TownPriceTrendPointResponse;

@WebMvcTest(InsightsController.class)
class InsightsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InsightsService insightsService;

    @Test
    void summaryReturnsStats() throws Exception {
        when(insightsService.summary(isNull(), isNull())).thenReturn(new SummaryStatsResponse(
            193456, new BigDecimal("512340.55"), new BigDecimal("495000.00"),
            new BigDecimal("140000.00"), new BigDecimal("1580000.00")));

        mockMvc.perform(get("/api/insights/summary"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalTransactions").value(193456))
            .andExpect(jsonPath("$.averagePrice").value(512340.55));
    }

    @Test
    void byTownReturnsRankedList() throws Exception {
        when(insightsService.averagePriceByTown(isNull(), isNull(), isNull())).thenReturn(List.of(
            new TownAveragePriceResponse("BEDOK", new BigDecimal("498000.00"), 5230)));

        mockMvc.perform(get("/api/insights/by-town"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].town").value("BEDOK"))
            .andExpect(jsonPath("$[0].transactionCount").value(5230));
    }

    @Test
    void priceTrendByTownReturnsPointsForEachTown() throws Exception {
        when(insightsService.priceTrendByTown("year")).thenReturn(List.of(
            new TownPriceTrendPointResponse("BEDOK", "2023", new BigDecimal("498000.00"), 5230),
            new TownPriceTrendPointResponse("ANG MO KIO", "2023", new BigDecimal("450000.00"), 3000)));

        mockMvc.perform(get("/api/insights/price-trend-by-town").param("groupBy", "year"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].town").value("BEDOK"))
            .andExpect(jsonPath("$[0].period").value("2023"))
            .andExpect(jsonPath("$[1].town").value("ANG MO KIO"));
    }

    @Test
    void priceTrendByTownRejectsInvalidGroupBy() throws Exception {
        when(insightsService.priceTrendByTown("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/price-trend-by-town").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void priceTrendByFlatTypeReturnsPointsForEachFlatType() throws Exception {
        when(insightsService.priceTrendByFlatType("year")).thenReturn(List.of(
            new FlatTypePriceTrendPointResponse("4 ROOM", "2023", new BigDecimal("498000.00"), 5230),
            new FlatTypePriceTrendPointResponse("3 ROOM", "2023", new BigDecimal("380000.00"), 3000)));

        mockMvc.perform(get("/api/insights/price-trend-by-flat-type").param("groupBy", "year"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].flatType").value("4 ROOM"))
            .andExpect(jsonPath("$[0].period").value("2023"))
            .andExpect(jsonPath("$[1].flatType").value("3 ROOM"));
    }

    @Test
    void priceTrendByFlatTypeRejectsInvalidGroupBy() throws Exception {
        when(insightsService.priceTrendByFlatType("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/price-trend-by-flat-type").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void maxPriceTrendByTownReturnsPointsForEachTown() throws Exception {
        when(insightsService.maxPriceTrendByTown("year")).thenReturn(List.of(
            new TownMaxPriceTrendPointResponse("BEDOK", "2023", new BigDecimal("880000.00"), 5230),
            new TownMaxPriceTrendPointResponse("ANG MO KIO", "2023", new BigDecimal("760000.00"), 3000)));

        mockMvc.perform(get("/api/insights/max-price-trend-by-town").param("groupBy", "year"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].town").value("BEDOK"))
            .andExpect(jsonPath("$[0].maxPrice").value(880000.00))
            .andExpect(jsonPath("$[1].town").value("ANG MO KIO"));
    }

    @Test
    void maxPriceTrendByTownRejectsInvalidGroupBy() throws Exception {
        when(insightsService.maxPriceTrendByTown("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/max-price-trend-by-town").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void minPriceTrendByTownReturnsPointsForEachTown() throws Exception {
        when(insightsService.minPriceTrendByTown("year")).thenReturn(List.of(
            new TownMinPriceTrendPointResponse("BEDOK", "2023", new BigDecimal("280000.00"), 5230),
            new TownMinPriceTrendPointResponse("ANG MO KIO", "2023", new BigDecimal("260000.00"), 3000)));

        mockMvc.perform(get("/api/insights/min-price-trend-by-town").param("groupBy", "year"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].town").value("BEDOK"))
            .andExpect(jsonPath("$[0].minPrice").value(280000.00))
            .andExpect(jsonPath("$[1].town").value("ANG MO KIO"));
    }

    @Test
    void minPriceTrendByTownRejectsInvalidGroupBy() throws Exception {
        when(insightsService.minPriceTrendByTown("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/min-price-trend-by-town").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void medianPriceTrendByTownReturnsPointsForEachTown() throws Exception {
        when(insightsService.medianPriceTrendByTown("year")).thenReturn(List.of(
            new TownMedianPriceTrendPointResponse("BEDOK", "2023", new BigDecimal("480000.00"), 5230),
            new TownMedianPriceTrendPointResponse("ANG MO KIO", "2023", new BigDecimal("440000.00"), 3000)));

        mockMvc.perform(get("/api/insights/median-price-trend-by-town").param("groupBy", "year"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].town").value("BEDOK"))
            .andExpect(jsonPath("$[0].medianPrice").value(480000.00))
            .andExpect(jsonPath("$[1].town").value("ANG MO KIO"));
    }

    @Test
    void medianPriceTrendByTownRejectsInvalidGroupBy() throws Exception {
        when(insightsService.medianPriceTrendByTown("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/median-price-trend-by-town").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void pricePerSqmTrendByTownReturnsPointsForEachTown() throws Exception {
        when(insightsService.pricePerSqmTrendByTown("year")).thenReturn(List.of(
            new TownPricePerSqmTrendPointResponse("BEDOK", "2023", new BigDecimal("5400.00"), 5230),
            new TownPricePerSqmTrendPointResponse("ANG MO KIO", "2023", new BigDecimal("5100.00"), 3000)));

        mockMvc.perform(get("/api/insights/price-per-sqm-trend-by-town").param("groupBy", "year"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].town").value("BEDOK"))
            .andExpect(jsonPath("$[0].pricePerSqm").value(5400.00))
            .andExpect(jsonPath("$[1].town").value("ANG MO KIO"));
    }

    @Test
    void pricePerSqmTrendByTownRejectsInvalidGroupBy() throws Exception {
        when(insightsService.pricePerSqmTrendByTown("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/price-per-sqm-trend-by-town").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void areaTrendReturnsPointsByPeriod() throws Exception {
        when(insightsService.areaTrend("month")).thenReturn(List.of(
            new AreaTrendPointResponse("2023-01", new BigDecimal("92.00"), 2000),
            new AreaTrendPointResponse("2023-02", new BigDecimal("95.00"), 1800)));

        mockMvc.perform(get("/api/insights/area-trend").param("groupBy", "month"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].period").value("2023-01"))
            .andExpect(jsonPath("$[0].medianArea").value(92.00))
            .andExpect(jsonPath("$[1].period").value("2023-02"));
    }

    @Test
    void areaTrendRejectsInvalidGroupBy() throws Exception {
        when(insightsService.areaTrend("week")).thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/area-trend").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void averagePriceByRemainingLeaseReturnsRankedByYears() throws Exception {
        when(insightsService.averagePriceByRemainingLease()).thenReturn(List.of(
            new RemainingLeasePriceResponse(60, new BigDecimal("400000.00"), 1200),
            new RemainingLeasePriceResponse(61, new BigDecimal("420000.00"), 900)));

        mockMvc.perform(get("/api/insights/average-price-by-remaining-lease"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].remainingLeaseYears").value(60))
            .andExpect(jsonPath("$[0].averagePrice").value(400000.00))
            .andExpect(jsonPath("$[1].remainingLeaseYears").value(61));
    }

    @Test
    void priceTrendRejectsInvalidGroupBy() throws Exception {
        when(insightsService.priceTrend(eq("week"), any(), any()))
            .thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/price-trend").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }
}
