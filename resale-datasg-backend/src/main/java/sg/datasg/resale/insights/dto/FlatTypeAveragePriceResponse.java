package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record FlatTypeAveragePriceResponse(String flatType, BigDecimal averagePrice, long transactionCount) {
}
