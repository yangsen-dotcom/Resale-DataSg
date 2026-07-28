package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface FlatTypePriceTrendProjection {
    String getFlatType();

    String getPeriod();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
