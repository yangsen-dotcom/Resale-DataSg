package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownMaxPriceTrendPointResponse(String town, String period, BigDecimal maxPrice,
    long transactionCount) {
}
