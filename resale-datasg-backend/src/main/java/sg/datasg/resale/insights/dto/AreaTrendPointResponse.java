package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record AreaTrendPointResponse(String period, BigDecimal medianArea, long transactionCount) {
}
