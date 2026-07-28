package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record FlatTypePriceTrendPointResponse(String flatType, String period, BigDecimal averagePrice,
    long transactionCount) {
}
