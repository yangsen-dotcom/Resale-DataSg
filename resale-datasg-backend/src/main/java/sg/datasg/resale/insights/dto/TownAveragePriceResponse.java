package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownAveragePriceResponse(String town, BigDecimal averagePrice, long transactionCount) {
}
