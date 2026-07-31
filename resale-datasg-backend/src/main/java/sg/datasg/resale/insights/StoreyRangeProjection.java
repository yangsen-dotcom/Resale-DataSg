package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface StoreyRangeProjection {
    String getStoreyRange();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
