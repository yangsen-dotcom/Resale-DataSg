package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record WealthIndexResponse(String town, String period, long millionDollarCount, long totalTransactionCount,
    BigDecimal millionDollarSharePercent) {
}
