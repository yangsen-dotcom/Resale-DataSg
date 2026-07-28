package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownMinPriceTrendProjection {
    String getTown();

    String getPeriod();

    BigDecimal getMinPrice();

    Long getTransactionCount();
}
