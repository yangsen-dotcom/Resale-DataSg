package sg.datasg.resale.insights;

import java.math.BigDecimal;

public interface RemainingLeaseProjection {
    Integer getRemainingLeaseYears();

    BigDecimal getAveragePrice();

    Long getTransactionCount();
}
