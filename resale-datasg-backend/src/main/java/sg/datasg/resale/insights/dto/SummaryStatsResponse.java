package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record SummaryStatsResponse(
    long totalTransactions,
    BigDecimal averagePrice,
    BigDecimal medianPrice,
    BigDecimal minPrice,
    BigDecimal maxPrice) {
}
