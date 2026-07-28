package sg.datasg.resale;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.YearMonth;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import sg.datasg.resale.transaction.ResaleTransaction;
import sg.datasg.resale.transaction.ResaleTransactionRepository;
import sg.datasg.resale.transaction.dto.PagedResponse;
import sg.datasg.resale.transaction.dto.TransactionResponse;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = "resale.ingestion.startup-ingestion-enabled=false")
class ResaleDataSgApplicationSmokeTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ResaleTransactionRepository repository;

    @Test
    void transactionsEndpointReturnsSeededData() {
        repository.save(new ResaleTransaction(YearMonth.of(2023, 6).atDay(1), "BEDOK", "4 ROOM", "123",
            "BEDOK NORTH RD", "07 TO 09", new BigDecimal("92.0"), "New Generation", (short) 1980,
            "56 years 01 month", new BigDecimal("520000.00")));

        ResponseEntity<PagedResponse<TransactionResponse>> response = restTemplate.exchange(
            "http://localhost:" + port + "/api/transactions",
            org.springframework.http.HttpMethod.GET, null,
            new org.springframework.core.ParameterizedTypeReference<>() {
            });

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().totalElements()).isEqualTo(1);
        assertThat(response.getBody().content().get(0).town()).isEqualTo("BEDOK");
    }

    @Test
    void insightsSummaryEndpointRespondsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "http://localhost:" + port + "/api/insights/summary", String.class);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
    }
}
