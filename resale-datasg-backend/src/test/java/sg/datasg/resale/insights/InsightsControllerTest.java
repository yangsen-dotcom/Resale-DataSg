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
import sg.datasg.resale.insights.dto.SummaryStatsResponse;
import sg.datasg.resale.insights.dto.TownAveragePriceResponse;

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
    void priceTrendRejectsInvalidGroupBy() throws Exception {
        when(insightsService.priceTrend(eq("week"), any(), any()))
            .thenThrow(new IllegalArgumentException("Invalid groupBy"));

        mockMvc.perform(get("/api/insights/price-trend").param("groupBy", "week"))
            .andExpect(status().isBadRequest());
    }
}
