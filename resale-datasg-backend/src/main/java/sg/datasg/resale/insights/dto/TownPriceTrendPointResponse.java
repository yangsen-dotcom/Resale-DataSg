package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownPriceTrendPointResponse(String town, String period, BigDecimal averagePrice, long transactionCount) {
}
