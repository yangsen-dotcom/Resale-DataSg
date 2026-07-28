package sg.datasg.resale.insights;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.YearMonth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import sg.datasg.resale.transaction.ResaleTransaction;
import sg.datasg.resale.transaction.ResaleTransactionRepository;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class InsightsRepositoryTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private ResaleTransactionRepository transactionRepository;

    @Autowired
    private InsightsRepository insightsRepository;

    @BeforeEach
    void seed() {
        transactionRepository.deleteAllInBatch();
        transactionRepository.save(row("2023-01", "BEDOK", "4 ROOM", "100000"));
        transactionRepository.save(row("2023-01", "BEDOK", "4 ROOM", "200000"));
        transactionRepository.save(row("2023-02", "BEDOK", "3 ROOM", "300000"));
        transactionRepository.save(row("2023-02", "TAMPINES", "4 ROOM", "400000"));
    }

    @Test
    void summaryStatsComputesAggregatesAcrossAllRows() {
        SummaryStatsProjection stats = insightsRepository.summaryStats(null, null);

        assertThat(stats.getTotalTransactions()).isEqualTo(4);
        assertThat(stats.getAveragePrice()).isEqualByComparingTo(new BigDecimal("250000"));
        assertThat(stats.getMedianPrice()).isEqualByComparingTo(new BigDecimal("250000"));
        assertThat(stats.getMinPrice()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(stats.getMaxPrice()).isEqualByComparingTo(new BigDecimal("400000"));
    }

    @Test
    void summaryStatsFiltersByTown() {
        SummaryStatsProjection stats = insightsRepository.summaryStats("BEDOK", null);

        assertThat(stats.getTotalTransactions()).isEqualTo(3);
        assertThat(stats.getMaxPrice()).isEqualByComparingTo(new BigDecimal("300000"));
    }

    @Test
    void priceTrendGroupsByMonthChronologically() {
        var trend = insightsRepository.priceTrend("month", null, null);

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023-01");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(2);
        assertThat(trend.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("150000"));
        assertThat(trend.get(1).getPeriod()).isEqualTo("2023-02");
        assertThat(trend.get(1).getTransactionCount()).isEqualTo(2);
    }

    @Test
    void priceTrendGroupsByYear() {
        var trend = insightsRepository.priceTrend("year", null, null);

        assertThat(trend).hasSize(1);
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(4);
    }

    @Test
    void averagePriceByTownRanksDescending() {
        var byTown = insightsRepository.averagePriceByTown(null, null, null);

        assertThat(byTown).hasSize(2);
        assertThat(byTown.get(0).getTown()).isEqualTo("TAMPINES");
        assertThat(byTown.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("400000"));
        assertThat(byTown.get(1).getTown()).isEqualTo("BEDOK");
    }

    @Test
    void averagePriceByFlatTypeFiltersByMonthRange() {
        YearMonth feb2023 = YearMonth.of(2023, 2);
        var byFlatType = insightsRepository.averagePriceByFlatType(null,
            feb2023.atDay(1), feb2023.atEndOfMonth());

        assertThat(byFlatType).hasSize(2);
        assertThat(byFlatType).extracting(FlatTypeAverageProjection::getFlatType)
            .containsExactlyInAnyOrder("3 ROOM", "4 ROOM");
    }

    private ResaleTransaction row(String month, String town, String flatType, String price) {
        return new ResaleTransaction(YearMonth.parse(month).atDay(1), town, flatType, "123", "SOME ST",
            "01 TO 03", new BigDecimal("90.0"), "Model A", (short) 1990, "65 years", new BigDecimal(price));
    }
}
