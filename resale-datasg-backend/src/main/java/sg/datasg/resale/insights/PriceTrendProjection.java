package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface PriceTrendProjection {
    String getPeriod();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
