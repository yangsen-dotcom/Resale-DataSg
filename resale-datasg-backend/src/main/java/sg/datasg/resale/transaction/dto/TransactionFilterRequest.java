package sg.datasg.resale.transaction.dto;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public record TransactionFilterRequest(
    List<String> towns,
    List<String> flatTypes,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    YearMonth fromMonth,
    YearMonth toMonth) {
}
