package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface TownFlatTypeProjection {
    String getTown();

    String getFlatType();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
