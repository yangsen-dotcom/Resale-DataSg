package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownPricePerSqmTrendPointResponse(String town, String period, BigDecimal pricePerSqm,
    long transactionCount) {
}
