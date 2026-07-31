package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record StoreyRangePriceResponse(String storeyRange, BigDecimal averagePrice, long transactionCount) {
}
