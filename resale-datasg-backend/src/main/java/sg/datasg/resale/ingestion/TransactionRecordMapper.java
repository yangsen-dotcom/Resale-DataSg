package sg.datasg.resale.ingestion;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Component;
import sg.datasg.resale.ingestion.datagovsg.RawResaleTransactionRecord;
import sg.datasg.resale.transaction.ResaleTransaction;

@Component
public class TransactionRecordMapper {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    public ResaleTransaction toEntity(RawResaleTransactionRecord raw) {
        return new ResaleTransaction(
            YearMonth.parse(raw.month(), MONTH_FORMAT).atDay(1),
            raw.town(),
            raw.flatType(),
            raw.block(),
            raw.streetName(),
            raw.storeyRange(),
            new BigDecimal(raw.floorAreaSqm()),
            raw.flatModel(),
            Short.parseShort(raw.leaseCommenceDate()),
            raw.remainingLease(),
            new BigDecimal(raw.resalePrice()));
    }
}
