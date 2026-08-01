package sg.datasg.resale.insights;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

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
    void priceTrendByTownGroupsByTownAndYear() {
        var trend = insightsRepository.priceTrendByTown("year");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getTown()).isEqualTo("BEDOK");
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(3);
        assertThat(trend.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("200000"));
        assertThat(trend.get(1).getTown()).isEqualTo("TAMPINES");
        assertThat(trend.get(1).getAveragePrice()).isEqualByComparingTo(new BigDecimal("400000"));
    }

    @Test
    void priceTrendByFlatTypeGroupsByFlatTypeAndYear() {
        var trend = insightsRepository.priceTrendByFlatType("year");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getFlatType()).isEqualTo("3 ROOM");
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(1);
        assertThat(trend.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("300000"));
        assertThat(trend.get(1).getFlatType()).isEqualTo("4 ROOM");
        assertThat(trend.get(1).getTransactionCount()).isEqualTo(3);
        assertThat(trend.get(1).getAveragePrice().doubleValue()).isCloseTo(233333.33, within(1.0));
    }

    @Test
    void maxPriceTrendByTownGroupsByTownAndYear() {
        var trend = insightsRepository.maxPriceTrendByTown("year");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getTown()).isEqualTo("BEDOK");
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(3);
        assertThat(trend.get(0).getMaxPrice()).isEqualByComparingTo(new BigDecimal("300000"));
        assertThat(trend.get(1).getTown()).isEqualTo("TAMPINES");
        assertThat(trend.get(1).getMaxPrice()).isEqualByComparingTo(new BigDecimal("400000"));
    }

    @Test
    void minPriceTrendByTownGroupsByTownAndYear() {
        var trend = insightsRepository.minPriceTrendByTown("year");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getTown()).isEqualTo("BEDOK");
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(3);
        assertThat(trend.get(0).getMinPrice()).isEqualByComparingTo(new BigDecimal("100000"));
        assertThat(trend.get(1).getTown()).isEqualTo("TAMPINES");
        assertThat(trend.get(1).getMinPrice()).isEqualByComparingTo(new BigDecimal("400000"));
    }

    @Test
    void medianPriceTrendByTownGroupsByTownAndYear() {
        var trend = insightsRepository.medianPriceTrendByTown("year");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getTown()).isEqualTo("BEDOK");
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(3);
        assertThat(trend.get(0).getMedianPrice()).isEqualByComparingTo(new BigDecimal("200000"));
        assertThat(trend.get(1).getTown()).isEqualTo("TAMPINES");
        assertThat(trend.get(1).getMedianPrice()).isEqualByComparingTo(new BigDecimal("400000"));
    }

    @Test
    void pricePerSqmTrendByTownGroupsByTownAndYear() {
        var trend = insightsRepository.pricePerSqmTrendByTown("year");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getTown()).isEqualTo("BEDOK");
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(3);
        assertThat(trend.get(0).getPricePerSqm().doubleValue()).isCloseTo(2222.22, within(1.0));
        assertThat(trend.get(1).getTown()).isEqualTo("TAMPINES");
        assertThat(trend.get(1).getPricePerSqm().doubleValue()).isCloseTo(4444.44, within(1.0));
    }

    @Test
    void areaTrendGroupsByMonthChronologically() {
        var trend = insightsRepository.areaTrend("month");

        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).getPeriod()).isEqualTo("2023-01");
        assertThat(trend.get(0).getTransactionCount()).isEqualTo(2);
        assertThat(trend.get(0).getMedianArea()).isEqualByComparingTo(new BigDecimal("90.0"));
        assertThat(trend.get(1).getPeriod()).isEqualTo("2023-02");
        assertThat(trend.get(1).getTransactionCount()).isEqualTo(2);
    }

    @Test
    void averagePriceByRemainingLeaseParsesWholeYearsFromLeaseString() {
        var byRemainingLease = insightsRepository.averagePriceByRemainingLease();

        assertThat(byRemainingLease).hasSize(1);
        assertThat(byRemainingLease.get(0).getRemainingLeaseYears()).isEqualTo(65);
        assertThat(byRemainingLease.get(0).getTransactionCount()).isEqualTo(4);
        assertThat(byRemainingLease.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("250000"));
    }

    @Test
    void averagePriceByStoreyRangeGroupsByRange() {
        var byStoreyRange = insightsRepository.averagePriceByStoreyRange();

        assertThat(byStoreyRange).hasSize(1);
        assertThat(byStoreyRange.get(0).getStoreyRange()).isEqualTo("01 TO 03");
        assertThat(byStoreyRange.get(0).getTransactionCount()).isEqualTo(4);
        assertThat(byStoreyRange.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("250000"));
    }

    @Test
    void averagePriceByTownAndFlatTypeGroupsByBothDimensions() {
        var byTownAndFlatType = insightsRepository.averagePriceByTownAndFlatType();

        assertThat(byTownAndFlatType).hasSize(3);
        assertThat(byTownAndFlatType.get(0).getTown()).isEqualTo("BEDOK");
        assertThat(byTownAndFlatType.get(0).getFlatType()).isEqualTo("3 ROOM");
        assertThat(byTownAndFlatType.get(0).getAveragePrice()).isEqualByComparingTo(new BigDecimal("300000"));
        assertThat(byTownAndFlatType.get(0).getTransactionCount()).isEqualTo(1);
        assertThat(byTownAndFlatType.get(1).getTown()).isEqualTo("BEDOK");
        assertThat(byTownAndFlatType.get(1).getFlatType()).isEqualTo("4 ROOM");
        assertThat(byTownAndFlatType.get(1).getAveragePrice()).isEqualByComparingTo(new BigDecimal("150000"));
        assertThat(byTownAndFlatType.get(1).getTransactionCount()).isEqualTo(2);
        assertThat(byTownAndFlatType.get(2).getTown()).isEqualTo("TAMPINES");
        assertThat(byTownAndFlatType.get(2).getFlatType()).isEqualTo("4 ROOM");
        assertThat(byTownAndFlatType.get(2).getAveragePrice()).isEqualByComparingTo(new BigDecimal("400000"));
    }

    @Test
    void wealthIndexByTownGroupsByTownAndYearAcrossTheWholeDataset() {
        transactionRepository.save(row("2020-01", "BUKIT TIMAH", "5 ROOM", "1200000"));
        transactionRepository.save(row("2020-06", "BUKIT TIMAH", "5 ROOM", "1500000"));
        transactionRepository.save(row("2020-03", "BUKIT TIMAH", "4 ROOM", "900000"));
        transactionRepository.save(row("2021-01", "BUKIT TIMAH", "5 ROOM", "1100000"));

        var wealthIndex = insightsRepository.wealthIndexByTown();

        var bt2020 = wealthIndex.stream()
            .filter(p -> p.getTown().equals("BUKIT TIMAH") && p.getPeriod().equals("2020"))
            .findFirst().orElseThrow();
        assertThat(bt2020.getMillionDollarCount()).isEqualTo(2);
        assertThat(bt2020.getTotalTransactionCount()).isEqualTo(3);

        var bt2021 = wealthIndex.stream()
            .filter(p -> p.getTown().equals("BUKIT TIMAH") && p.getPeriod().equals("2021"))
            .findFirst().orElseThrow();
        assertThat(bt2021.getMillionDollarCount()).isEqualTo(1);
        assertThat(bt2021.getTotalTransactionCount()).isEqualTo(1);

        // The shared @BeforeEach seed (2023, all under $1,000,000) shows up too, with a
        // zero million-dollar count - this endpoint covers every year in the dataset.
        var bedok2023 = wealthIndex.stream()
            .filter(p -> p.getTown().equals("BEDOK") && p.getPeriod().equals("2023"))
            .findFirst().orElseThrow();
        assertThat(bedok2023.getMillionDollarCount()).isEqualTo(0);
        assertThat(bedok2023.getTotalTransactionCount()).isEqualTo(3);
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
