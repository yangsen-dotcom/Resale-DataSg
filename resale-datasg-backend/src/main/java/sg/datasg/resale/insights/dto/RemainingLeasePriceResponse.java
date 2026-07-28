package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record RemainingLeasePriceResponse(int remainingLeaseYears, BigDecimal averagePrice, long transactionCount) {
}
