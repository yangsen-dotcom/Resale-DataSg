package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownMedianPriceTrendProjection {
    String getTown();

    String getPeriod();

    BigDecimal getMedianPrice();

    Long getTransactionCount();
}
