package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownMinPriceTrendPointResponse(String town, String period, BigDecimal minPrice,
    long transactionCount) {
}
