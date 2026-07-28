package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record PriceTrendPointResponse(String period, BigDecimal averagePrice, long transactionCount) {
}
