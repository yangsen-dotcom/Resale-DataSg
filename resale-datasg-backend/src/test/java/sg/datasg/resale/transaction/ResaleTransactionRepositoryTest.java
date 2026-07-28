package sg.datasg.resale.transaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import sg.datasg.resale.transaction.dto.TransactionFilterRequest;

@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ResaleTransactionRepositoryTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private ResaleTransactionRepository repository;

    @BeforeEach
    void seed() {
        repository.deleteAllInBatch();
        repository.save(transaction("2023-01", "BEDOK", "4 ROOM", new BigDecimal("500000")));
        repository.save(transaction("2023-02", "BEDOK", "3 ROOM", new BigDecimal("400000")));
        repository.save(transaction("2023-01", "TAMPINES", "4 ROOM", new BigDecimal("520000")));
    }

    @Test
    void filtersByTownAndFlatType() {
        TransactionFilterRequest filter =
            new TransactionFilterRequest(java.util.List.of("BEDOK"), java.util.List.of("4 ROOM"), null, null, null,
                null, null);

        var page = repository.findAll(ResaleTransactionSpecification.fromFilter(filter),
            PageRequest.of(0, 10, Sort.by("month")));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getTown()).isEqualTo("BEDOK");
        assertThat(page.getContent().get(0).getFlatType()).isEqualTo("4 ROOM");
    }

    @Test
    void filtersByPriceRange() {
        TransactionFilterRequest filter = new TransactionFilterRequest(null, null,
            new BigDecimal("450000"), new BigDecimal("510000"), null, null, null);

        var page = repository.findAll(ResaleTransactionSpecification.fromFilter(filter), PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getResalePrice()).isEqualByComparingTo(new BigDecimal("500000"));
    }

    @Test
    void filtersByBlock() {
        repository.save(transaction("2023-03", "BEDOK", "4 ROOM", "999", "OTHER ST", new BigDecimal("600000")));

        TransactionFilterRequest filter = new TransactionFilterRequest(null, null, null, null, null, null, "999");

        var page = repository.findAll(ResaleTransactionSpecification.fromFilter(filter), PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getBlock()).isEqualTo("999");
    }

    @Test
    void findsDistinctTownsSorted() {
        assertThat(repository.findDistinctTowns()).containsExactly("BEDOK", "TAMPINES");
    }

    @Test
    void findsDistinctFlatTypesSorted() {
        assertThat(repository.findDistinctFlatTypes()).containsExactly("3 ROOM", "4 ROOM");
    }

    @Test
    void findsDistinctBlocksByTown() {
        repository.save(transaction("2023-03", "BEDOK", "5 ROOM", "789", "ANOTHER ST", new BigDecimal("600000")));

        var blocks = repository.findDistinctBlocksByTown("BEDOK");

        assertThat(blocks).extracting(ResaleTransactionRepository.BlockOption::getBlock)
            .containsExactly("123", "789");
        assertThat(blocks.get(1).getStreetName()).isEqualTo("ANOTHER ST");
    }

    private ResaleTransaction transaction(String month, String town, String flatType, BigDecimal price) {
        return transaction(month, town, flatType, "123", "SOME ST", price);
    }

    private ResaleTransaction transaction(String month, String town, String flatType, String block,
        String streetName, BigDecimal price) {
        java.time.YearMonth ym = java.time.YearMonth.parse(month);
        return new ResaleTransaction(ym.atDay(1), town, flatType, block, streetName, "01 TO 03",
            new BigDecimal("90.0"), "Model A", (short) 1990, "65 years", price);
    }
}
