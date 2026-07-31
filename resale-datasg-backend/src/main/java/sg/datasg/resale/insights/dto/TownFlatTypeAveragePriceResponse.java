package sg.datasg.resale.insights.dto;

import java.math.BigDecimal;

public record TownFlatTypeAveragePriceResponse(String town, String flatType, BigDecimal averagePrice,
    long transactionCount) {
}
