package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownAverageProjection {
    String getTown();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
