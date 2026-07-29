package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownMedianPriceTrendPointResponse(String town, String period, BigDecimal medianPrice,
    long transactionCount) {
}
