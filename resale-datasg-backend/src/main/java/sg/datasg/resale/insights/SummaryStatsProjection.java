package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface SummaryStatsProjection {
    Long getTotalTransactions();

    BigDecimal getAveragePrice();

    BigDecimal getMedianPrice();

    BigDecimal getMinPrice();

    BigDecimal getMaxPrice();
}
