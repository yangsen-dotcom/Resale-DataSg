package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface AreaTrendProjection {
    String getPeriod();

    BigDecimal getMedianArea();

    Long getTransactionCount();
}
