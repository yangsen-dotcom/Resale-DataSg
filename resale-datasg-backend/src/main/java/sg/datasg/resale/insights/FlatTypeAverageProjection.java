package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface FlatTypeAverageProjection {
    String getFlatType();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
