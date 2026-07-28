package sg.datasg.resale.ingestion;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import sg.datasg.resale.ingestion.datagovsg.RawResaleTransactionRecord;
import sg.datasg.resale.transaction.ResaleTransaction;

class TransactionRecordMapperTest {

    private final TransactionRecordMapper mapper = new TransactionRecordMapper();

    @Test
    void mapsAllFieldsFromRawRecord() {
        RawResaleTransactionRecord raw = new RawResaleTransactionRecord(
            "2017-01", "ANG MO KIO", "2 ROOM", "406", "ANG MO KIO AVE 10", "10 TO 12",
            "44", "Improved", "1979", "61 years 04 months", "232000");

        ResaleTransaction entity = mapper.toEntity(raw);

        assertThat(entity.getMonth()).isEqualTo(LocalDate.of(2017, 1, 1));
        assertThat(entity.getTown()).isEqualTo("ANG MO KIO");
        assertThat(entity.getFlatType()).isEqualTo("2 ROOM");
        assertThat(entity.getBlock()).isEqualTo("406");
        assertThat(entity.getStreetName()).isEqualTo("ANG MO KIO AVE 10");
        assertThat(entity.getStoreyRange()).isEqualTo("10 TO 12");
        assertThat(entity.getFloorAreaSqm()).isEqualByComparingTo(new BigDecimal("44"));
        assertThat(entity.getFlatModel()).isEqualTo("Improved");
        assertThat(entity.getLeaseCommenceDate()).isEqualTo((short) 1979);
        assertThat(entity.getRemainingLease()).isEqualTo("61 years 04 months");
        assertThat(entity.getResalePrice()).isEqualByComparingTo(new BigDecimal("232000"));
    }

    @Test
    void handlesRemainingLeaseWithoutMonthsComponent() {
        RawResaleTransactionRecord raw = new RawResaleTransactionRecord(
            "2023-06", "BEDOK", "4 ROOM", "123", "BEDOK NORTH RD", "07 TO 09",
            "92.0", "New Generation", "1980", "56 years", "520000.50");

        ResaleTransaction entity = mapper.toEntity(raw);

        assertThat(entity.getRemainingLease()).isEqualTo("56 years");
        assertThat(entity.getFloorAreaSqm()).isEqualByComparingTo(new BigDecimal("92.0"));
        assertThat(entity.getResalePrice()).isEqualByComparingTo(new BigDecimal("520000.50"));
    }

    @Test
    void parsesDecemberMonthCorrectly() {
        RawResaleTransactionRecord raw = new RawResaleTransactionRecord(
            "2020-12", "TAMPINES", "5 ROOM", "1", "TAMPINES ST 1", "01 TO 03",
            "110", "Model A", "1990", "65 years 02 months", "450000");

        ResaleTransaction entity = mapper.toEntity(raw);

        assertThat(entity.getMonth()).isEqualTo(LocalDate.of(2020, 12, 1));
    }
}
