package sg.datasg.resale.transaction.dto;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import sg.datasg.resale.transaction.ResaleTransaction;

public record TransactionResponse(
    Long id,
    String month,
    String town,
    String flatType,
    String block,
    String streetName,
    String storeyRange,
    BigDecimal floorAreaSqm,
    String flatModel,
    Short leaseCommenceDate,
    String remainingLease,
    BigDecimal resalePrice) {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    public static TransactionResponse from(ResaleTransaction entity) {
        return new TransactionResponse(
            entity.getId(),
            MONTH_FORMAT.format(entity.getMonth()),
            entity.getTown(),
            entity.getFlatType(),
            entity.getBlock(),
            entity.getStreetName(),
            entity.getStoreyRange(),
            entity.getFloorAreaSqm(),
            entity.getFlatModel(),
            entity.getLeaseCommenceDate(),
            entity.getRemainingLease(),
            entity.getResalePrice());
    }
}
