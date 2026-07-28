package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownMaxPriceTrendProjection {
    String getTown();

    String getPeriod();

    BigDecimal getMaxPrice();

    Long getTransactionCount();
}
