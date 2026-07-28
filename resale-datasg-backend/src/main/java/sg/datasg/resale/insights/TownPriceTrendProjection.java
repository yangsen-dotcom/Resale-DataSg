package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownPriceTrendProjection {
    String getTown();

    String getPeriod();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
