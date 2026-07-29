package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownPricePerSqmTrendProjection {
    String getTown();

    String getPeriod();

    BigDecimal getPricePerSqm();

    Long getTransactionCount();
}
